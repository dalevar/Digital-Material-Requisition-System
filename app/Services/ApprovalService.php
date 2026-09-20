<?php

namespace App\Services;

use App\Enums\MaterialRequestStatus;
use App\Models\ApprovalHistory;
use App\Models\MaterialRequest;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;

class ApprovalService
{
    public function approve(MaterialRequest $request, User $approver, ?string $reason = null): MaterialRequest
    {
        if ($approver->id === $request->requester_id) {
            throw new Exception('Self-approval is strictly forbidden. Requester cannot approve their own request.');
        }

        if (! in_array($request->status, [MaterialRequestStatus::SUBMITTED, MaterialRequestStatus::PENDING_APPROVAL])) {
            throw new Exception('Only PENDING_APPROVAL or SUBMITTED requests can be approved.');
        }

        return DB::transaction(function () use ($request, $approver, $reason) {
            $oldStatus = $request->status->value;

            $request->update([
                'status' => MaterialRequestStatus::APPROVED,
                'approver_id' => $approver->id,
                'approved_at' => now(),
            ]);

            // Create immutable approval history record
            ApprovalHistory::create([
                'request_id' => $request->id,
                'approver_id' => $approver->id,
                'action' => 'APPROVED',
                'reason' => $reason ?? 'Approved by Executive / HoD',
                'action_at' => now(),
            ]);

            if ($request->requester) {
                NotificationService::notify(
                    $request->requester,
                    'REQUEST_APPROVED',
                    'Request Approved',
                    "Your material request {$request->request_no} has been approved by {$approver->name}.",
                    ['request_id' => $request->id, 'request_no' => $request->request_no]
                );
            }

            AuditService::log(
                $approver,
                'APPROVE_REQUEST',
                'Approval',
                'MaterialRequest',
                (string) $request->id,
                ['status' => $oldStatus],
                ['status' => MaterialRequestStatus::APPROVED->value],
                "Executive/HoD {$approver->name} approved request {$request->request_no}"
            );

            return $request;
        });
    }

    public function reject(MaterialRequest $request, User $approver, string $rejectionReason): MaterialRequest
    {
        if (trim($rejectionReason) === '') {
            throw new Exception('Rejection reason is mandatory when rejecting a request.');
        }

        if ($approver->id === $request->requester_id) {
            throw new Exception('Self-rejection/approval is strictly forbidden.');
        }

        if (! in_array($request->status, [MaterialRequestStatus::SUBMITTED, MaterialRequestStatus::PENDING_APPROVAL])) {
            throw new Exception('Only PENDING_APPROVAL or SUBMITTED requests can be rejected.');
        }

        return DB::transaction(function () use ($request, $approver, $rejectionReason) {
            $oldStatus = $request->status->value;

            $request->update([
                'status' => MaterialRequestStatus::REJECTED,
                'approver_id' => $approver->id,
                'rejected_at' => now(),
                'rejection_reason' => $rejectionReason,
            ]);

            // Create immutable approval history record
            ApprovalHistory::create([
                'request_id' => $request->id,
                'approver_id' => $approver->id,
                'action' => 'REJECTED',
                'reason' => $rejectionReason,
                'action_at' => now(),
            ]);

            if ($request->requester) {
                NotificationService::notify(
                    $request->requester,
                    'REQUEST_REJECTED',
                    'Request Rejected',
                    "Your material request {$request->request_no} was rejected. Reason: {$rejectionReason}",
                    ['request_id' => $request->id, 'request_no' => $request->request_no, 'reason' => $rejectionReason]
                );
            }

            AuditService::log(
                $approver,
                'REJECT_REQUEST',
                'Approval',
                'MaterialRequest',
                (string) $request->id,
                ['status' => $oldStatus],
                ['status' => MaterialRequestStatus::REJECTED->value, 'rejection_reason' => $rejectionReason],
                "Executive/HoD {$approver->name} rejected request {$request->request_no}. Reason: {$rejectionReason}"
            );

            return $request;
        });
    }
}
