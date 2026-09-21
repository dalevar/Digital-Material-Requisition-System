<?php

namespace App\Services;

use App\Enums\MaterialRequestStatus;
use App\Enums\StockTransactionType;
use App\Models\Material;
use App\Models\MaterialRequest;
use App\Models\MaterialRequestItem;
use App\Models\StockTransaction;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;

class MaterialRequestService
{
    public function generateRequestNumber(): string
    {
        $year = date('Y');
        $prefix = "MR-{$year}-";

        $latest = MaterialRequest::where('request_no', 'LIKE', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->first();

        if (! $latest) {
            return "{$prefix}000001";
        }

        $lastSeq = (int) substr($latest->request_no, -6);
        $nextSeq = str_pad($lastSeq + 1, 6, '0', STR_PAD_LEFT);

        return "{$prefix}{$nextSeq}";
    }

    public function createDraft(User $requester, array $headerData, array $items): MaterialRequest
    {
        return DB::transaction(function () use ($requester, $headerData, $items) {
            $requestNo = $this->generateRequestNumber();

            $request = MaterialRequest::create([
                'request_no' => $requestNo,
                'no_doc' => $headerData['no_doc'] ?? null,
                'request_date' => $headerData['request_date'] ?? now()->toDateString(),
                'requester_id' => $requester->id,
                'department_id' => $headerData['department_id'] ?? $requester->department_id,
                'plant_id' => $headerData['plant_id'] ?? $requester->plant_id,
                'gl_account' => $headerData['gl_account'] ?? null,
                'pwo_no' => $headerData['pwo_no'] ?? null,
                'pur_org' => $headerData['pur_org'] ?? null,
                'pur_group' => $headerData['pur_group'] ?? null,
                'cost_center' => $headerData['cost_center'] ?? null,
                'reason' => $headerData['reason'] ?? null,
                'status' => MaterialRequestStatus::DRAFT,
                'approver_id' => $headerData['approver_id'] ?? $requester->approver_id,
            ]);

            $this->saveItems($request, $items);

            AuditService::log(
                $requester,
                'CREATE_DRAFT',
                'MaterialRequest',
                'MaterialRequest',
                (string) $request->id,
                null,
                $request->toArray(),
                "Created draft request {$request->request_no}"
            );

            return $request;
        });
    }

    public function updateRequest(MaterialRequest $request, array $headerData, array $items, User $user): MaterialRequest
    {
        if ($user->isAdmin()) {
            if (in_array($request->status, [MaterialRequestStatus::COMPLETED, MaterialRequestStatus::CANCELLED, MaterialRequestStatus::CANCELLED_AFTER_APPROVAL])) {
                throw new Exception('Completed or Cancelled requests cannot be edited.');
            }
        } elseif (! in_array($request->status, [MaterialRequestStatus::DRAFT, MaterialRequestStatus::REJECTED])) {
            throw new Exception('Only DRAFT or REJECTED requests can be edited by requester.');
        }

        return DB::transaction(function () use ($request, $headerData, $items, $user) {
            $oldData = $request->load('items')->toArray();

            $updateData = [
                'request_date' => $headerData['request_date'] ?? $request->request_date,
                'no_doc' => array_key_exists('no_doc', $headerData) ? $headerData['no_doc'] : $request->no_doc,
                'department_id' => $headerData['department_id'] ?? $request->department_id,
                'plant_id' => $headerData['plant_id'] ?? $request->plant_id,
                'gl_account' => array_key_exists('gl_account', $headerData) ? $headerData['gl_account'] : $request->gl_account,
                'pwo_no' => array_key_exists('pwo_no', $headerData) ? $headerData['pwo_no'] : $request->pwo_no,
                'pur_org' => array_key_exists('pur_org', $headerData) ? $headerData['pur_org'] : $request->pur_org,
                'pur_group' => array_key_exists('pur_group', $headerData) ? $headerData['pur_group'] : $request->pur_group,
                'cost_center' => array_key_exists('cost_center', $headerData) ? $headerData['cost_center'] : $request->cost_center,
                'reason' => array_key_exists('reason', $headerData) ? $headerData['reason'] : $request->reason,
                'approver_id' => $headerData['approver_id'] ?? $request->approver_id,
            ];

            if ($user->isAdmin() && ! empty($headerData['requester_id'])) {
                $updateData['requester_id'] = $headerData['requester_id'];
            }

            $request->update($updateData);

            $request->items()->delete();
            $this->saveItems($request, $items);

            AuditService::log(
                $user,
                'UPDATE_REQUEST',
                'MaterialRequest',
                'MaterialRequest',
                (string) $request->id,
                $oldData,
                $request->fresh('items')->toArray(),
                "Updated request {$request->request_no}"
            );

            return $request;
        });
    }

    public function submitRequest(MaterialRequest $request, User $user): MaterialRequest
    {
        if (! $request->status->canTransitionTo(MaterialRequestStatus::PENDING_APPROVAL)) {
            throw new Exception("Invalid status transition from {$request->status->value} to PENDING_APPROVAL");
        }

        if ($request->items()->count() === 0) {
            throw new Exception('Cannot submit request without any material items.');
        }

        $approverId = $request->approver_id ?? $user->approver_id;
        if (! $approverId) {
            throw new Exception('Approver must be designated before submitting request.');
        }

        if ($user->id === (int) $approverId) {
            throw new Exception('Requester cannot approve their own request.');
        }

        return DB::transaction(function () use ($request, $approverId, $user) {
            $oldStatus = $request->status->value;

            $request->update([
                'status' => MaterialRequestStatus::PENDING_APPROVAL,
                'approver_id' => $approverId,
            ]);

            $approver = User::find($approverId);
            if ($approver) {
                NotificationService::notify(
                    $approver,
                    'PENDING_APPROVAL',
                    'New Request Pending Approval',
                    "Request {$request->request_no} from {$user->name} requires your approval.",
                    ['request_id' => $request->id, 'request_no' => $request->request_no]
                );
            }

            AuditService::log(
                $user,
                'SUBMIT_REQUEST',
                'MaterialRequest',
                'MaterialRequest',
                (string) $request->id,
                ['status' => $oldStatus],
                ['status' => MaterialRequestStatus::PENDING_APPROVAL->value],
                "Submitted request {$request->request_no} for approval"
            );

            return $request;
        });
    }

    public function supplementMRF(MaterialRequest $request, array $adminFields, User $admin, string $reason): MaterialRequest
    {
        if ($request->status !== MaterialRequestStatus::APPROVED) {
            throw new Exception('Admin MRF edits can only be applied to APPROVED requests.');
        }

        return DB::transaction(function () use ($request, $adminFields, $admin, $reason) {
            $oldData = [
                'plant_id' => $request->plant_id,
                'gl_account' => $request->gl_account,
                'pwo_no' => $request->pwo_no,
                'pur_org' => $request->pur_org,
                'pur_group' => $request->pur_group,
                'cost_center' => $request->cost_center,
                'no_doc' => $request->no_doc,
            ];

            $request->update([
                'plant_id' => $adminFields['plant_id'] ?? $request->plant_id,
                'gl_account' => $adminFields['gl_account'] ?? $request->gl_account,
                'pwo_no' => $adminFields['pwo_no'] ?? $request->pwo_no,
                'pur_org' => $adminFields['pur_org'] ?? $request->pur_org,
                'pur_group' => $adminFields['pur_group'] ?? $request->pur_group,
                'cost_center' => $adminFields['cost_center'] ?? $request->cost_center,
                'no_doc' => $adminFields['no_doc'] ?? $request->no_doc,
            ]);

            $newData = [
                'plant_id' => $request->plant_id,
                'gl_account' => $request->gl_account,
                'pwo_no' => $request->pwo_no,
                'pur_org' => $request->pur_org,
                'pur_group' => $request->pur_group,
                'cost_center' => $request->cost_center,
                'no_doc' => $request->no_doc,
            ];

            AuditService::log(
                $admin,
                'SUPPLEMENT_MRF',
                'MaterialRequest',
                'MaterialRequest',
                (string) $request->id,
                $oldData,
                $newData,
                "Admin supplemented MRF fields on approved request {$request->request_no}. Reason: {$reason}"
            );

            return $request;
        });
    }

    public function cancelApprovedRequest(MaterialRequest $request, User $admin, string $cancellationReason, InventoryService $inventoryService): MaterialRequest
    {
        if ($request->status !== MaterialRequestStatus::APPROVED && $request->status !== MaterialRequestStatus::PROCESSING) {
            throw new Exception('Only APPROVED or PROCESSING requests can be cancelled by Admin.');
        }

        return DB::transaction(function () use ($request, $admin, $cancellationReason, $inventoryService) {
            $oldStatus = $request->status->value;

            // Check if stock out was previously issued for this request
            foreach ($request->items as $item) {
                $stockOutTx = StockTransaction::where('reference_type', 'MATERIAL_REQUEST')
                    ->where('reference_id', (string) $request->id)
                    ->where('material_id', $item->material_id)
                    ->where('transaction_type', StockTransactionType::STOCK_OUT)
                    ->first();

                if ($stockOutTx) {
                    // Automatic Stock Reversal!
                    $inventoryService->stockReversal(
                        $item->material_id,
                        (float) $item->qty,
                        $request->request_no,
                        $admin,
                        "Automatic reversal due to Admin Cancellation: {$cancellationReason}",
                        'MATERIAL_REQUEST_CANCEL',
                        (string) $request->id
                    );
                }
            }

            $request->update([
                'status' => MaterialRequestStatus::CANCELLED_AFTER_APPROVAL,
            ]);

            $request->approvalHistories()->create([
                'approver_id' => $admin->id,
                'action' => 'CANCELLED_AFTER_APPROVAL',
                'reason' => $cancellationReason,
                'action_at' => now(),
            ]);

            if ($request->requester) {
                NotificationService::notify(
                    $request->requester,
                    'REQUEST_CANCELLED',
                    'Request Cancelled After Approval',
                    "Your request {$request->request_no} was cancelled by Admin. Reason: {$cancellationReason}",
                    ['request_id' => $request->id, 'request_no' => $request->request_no]
                );
            }

            AuditService::log(
                $admin,
                'CANCEL_APPROVED_REQUEST',
                'MaterialRequest',
                'MaterialRequest',
                (string) $request->id,
                ['status' => $oldStatus],
                ['status' => MaterialRequestStatus::CANCELLED_AFTER_APPROVAL->value, 'reason' => $cancellationReason],
                "Admin cancelled approved request {$request->request_no}. Reason: {$cancellationReason}"
            );

            return $request;
        });
    }

    private function saveItems(MaterialRequest $request, array $items): void
    {
        foreach ($items as $item) {
            $material = Material::findOrFail($item['material_id']);
            $soh = $material->soh;
            $qty = (float) $item['qty'];
            $balance = $soh - $qty;

            MaterialRequestItem::create([
                'request_id' => $request->id,
                'material_id' => $material->id,
                'description' => $item['description'] ?? $material->description,
                'qty' => $qty,
                'uom' => $material->uom,
                'soh' => $soh,
                'balance' => $balance,
                'note' => $item['note'] ?? null,
            ]);
        }
    }
}
