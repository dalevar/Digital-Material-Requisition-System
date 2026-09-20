<?php

namespace App\Services;

use App\Enums\MaterialRequestStatus;
use App\Enums\StockTransactionType;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\InvalidRequestStateException;
use App\Models\Material;
use App\Models\MaterialRequest;
use App\Models\StockBalance;
use App\Models\StockTransaction;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function issueRequestStock(MaterialRequest $materialRequest, User $user): void
    {
        DB::transaction(function () use ($materialRequest, $user) {
            /** @var MaterialRequest $request */
            $request = MaterialRequest::where('id', $materialRequest->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! in_array($request->status, [MaterialRequestStatus::APPROVED, MaterialRequestStatus::PROCESSING])) {
                throw new InvalidRequestStateException(
                    "Request {$request->request_no} cannot be processed for stock out because its status is {$request->status->value}."
                );
            }

            $request->loadMissing('items.material');
            $shortages = [];

            foreach ($request->items as $item) {
                $material = $item->material;
                if (! $material) {
                    throw new Exception("Material associated with item ID {$item->id} was not found.");
                }
                if ($material->status !== 'ACTIVE') {
                    throw new Exception("Material {$material->material_number} is INACTIVE and cannot be issued.");
                }

                $stockBalance = StockBalance::where('material_id', $item->material_id)
                    ->lockForUpdate()
                    ->first();

                $currentSoh = $stockBalance ? (float) $stockBalance->quantity : 0;
                $requestedQty = (float) $item->qty;

                if ($currentSoh < $requestedQty) {
                    $shortages[] = [
                        'material_number' => $material->material_number,
                        'description' => $material->description,
                        'required' => $requestedQty,
                        'available' => $currentSoh,
                        'shortage' => $requestedQty - $currentSoh,
                        'uom' => $material->uom,
                    ];
                }
            }

            if (! empty($shortages)) {
                $shortageLines = array_map(function ($s) {
                    return "Material: {$s['material_number']} | Required: {$s['required']} {$s['uom']} | Available: {$s['available']} {$s['uom']} | Shortage: {$s['shortage']} {$s['uom']}";
                }, $shortages);

                throw new InsufficientStockException(
                    "Unable to process Stock Out due to insufficient stock:\n".implode("\n", $shortageLines),
                    $shortages
                );
            }

            foreach ($request->items as $item) {
                $stockBalance = StockBalance::where('material_id', $item->material_id)
                    ->lockForUpdate()
                    ->first();

                $oldBalance = (float) $stockBalance->quantity;
                $requestedQty = (float) $item->qty;
                $newBalance = $oldBalance - $requestedQty;

                $stockBalance->quantity = $newBalance;
                $stockBalance->save();

                $tx = StockTransaction::create([
                    'material_id' => $item->material_id,
                    'transaction_type' => StockTransactionType::STOCK_OUT,
                    'reference_type' => 'MATERIAL_REQUEST',
                    'reference_id' => (string) $request->id,
                    'reference_no' => $request->request_no,
                    'qty_in' => 0,
                    'qty_out' => $requestedQty,
                    'balance_after' => $newBalance,
                    'supplier' => null,
                    'storage_location' => $item->material->storage_location,
                    'reason' => 'Material Requisition Issue',
                    'transaction_date' => now(),
                    'user_id' => $user->id,
                    'note' => "Stock issued for request {$request->request_no} (Item ID: {$item->id})",
                ]);

                AuditService::log(
                    $user,
                    'STOCK_OUT',
                    'Inventory',
                    'StockTransaction',
                    (string) $tx->id,
                    ['soh_before' => $oldBalance],
                    ['material_id' => $item->material_id, 'qty_out' => $requestedQty, 'balance_after' => $newBalance],
                    "Stock Out issued for material {$item->material->material_number}: -{$requestedQty} {$item->material->uom}"
                );
            }

            $request->update(['status' => MaterialRequestStatus::COMPLETED]);

            AuditService::log(
                $user,
                'PROCESS_STOCK_OUT',
                'MaterialRequest',
                'MaterialRequest',
                (string) $request->id,
                ['status' => MaterialRequestStatus::APPROVED->value],
                ['status' => MaterialRequestStatus::COMPLETED->value],
                "Processed Stock Out for request {$request->request_no} - marked as COMPLETED"
            );
        });
    }

    public function stockIn(
        int $materialId,
        float $qty,
        string $referenceNo,
        User $user,
        ?string $supplier = null,
        ?string $storageLoc = null,
        ?string $note = null
    ): StockTransaction {
        if ($qty <= 0) {
            throw new Exception('Stock In quantity must be greater than zero.');
        }

        return DB::transaction(function () use ($materialId, $qty, $referenceNo, $user, $supplier, $storageLoc, $note) {
            $material = Material::findOrFail($materialId);

            $stockBalance = StockBalance::where('material_id', $materialId)
                ->lockForUpdate()
                ->first();

            if (! $stockBalance) {
                $stockBalance = StockBalance::create([
                    'material_id' => $materialId,
                    'quantity' => 0,
                ]);
                $stockBalance = StockBalance::where('material_id', $materialId)->lockForUpdate()->first();
            }

            $oldBalance = (float) $stockBalance->quantity;
            $newBalance = $oldBalance + $qty;
            $stockBalance->quantity = $newBalance;
            $stockBalance->save();

            $transaction = StockTransaction::create([
                'material_id' => $materialId,
                'transaction_type' => StockTransactionType::STOCK_IN,
                'reference_type' => 'STOCK_IN_ENTRY',
                'reference_id' => null,
                'reference_no' => $referenceNo,
                'qty_in' => $qty,
                'qty_out' => 0,
                'balance_after' => $newBalance,
                'supplier' => $supplier,
                'storage_location' => $storageLoc ?? $material->storage_location,
                'reason' => 'Stock In Entry',
                'transaction_date' => now(),
                'user_id' => $user->id,
                'note' => $note,
            ]);

            AuditService::log(
                $user,
                'STOCK_IN',
                'Inventory',
                'StockTransaction',
                (string) $transaction->id,
                ['soh_before' => $oldBalance],
                ['material_id' => $materialId, 'qty_in' => $qty, 'balance_after' => $newBalance],
                "Stock In for material {$material->material_number}: +{$qty} {$material->uom}"
            );

            return $transaction;
        });
    }

    public function stockOut(
        int $materialId,
        float $qty,
        string $referenceNo,
        User $user,
        string $referenceType = 'MATERIAL_REQUEST',
        ?string $referenceId = null,
        ?string $note = null
    ): StockTransaction {
        if ($qty <= 0) {
            throw new Exception('Stock Out quantity must be greater than zero.');
        }

        return DB::transaction(function () use ($materialId, $qty, $referenceNo, $user, $referenceType, $referenceId, $note) {
            if ($referenceId) {
                $existingTx = StockTransaction::where('material_id', $materialId)
                    ->where('transaction_type', StockTransactionType::STOCK_OUT)
                    ->where('reference_type', $referenceType)
                    ->where('reference_id', $referenceId)
                    ->first();

                if ($existingTx) {
                    return $existingTx;
                }
            }

            $material = Material::findOrFail($materialId);

            $stockBalance = StockBalance::where('material_id', $materialId)
                ->lockForUpdate()
                ->first();

            $currentSoh = $stockBalance ? (float) $stockBalance->quantity : 0;

            if ($currentSoh < $qty) {
                throw new InsufficientStockException("Insufficient stock for material {$material->material_number}. Available SOH: {$currentSoh}, Requested: {$qty}");
            }

            $stockBalance->quantity -= $qty;
            $stockBalance->save();

            $transaction = StockTransaction::create([
                'material_id' => $materialId,
                'transaction_type' => StockTransactionType::STOCK_OUT,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'reference_no' => $referenceNo,
                'qty_in' => 0,
                'qty_out' => $qty,
                'balance_after' => $stockBalance->quantity,
                'supplier' => null,
                'storage_location' => $material->storage_location,
                'reason' => 'Material Requisition Issue',
                'transaction_date' => now(),
                'user_id' => $user->id,
                'note' => $note,
            ]);

            AuditService::log(
                $user,
                'STOCK_OUT',
                'Inventory',
                'StockTransaction',
                (string) $transaction->id,
                ['soh_before' => $currentSoh],
                ['material_id' => $materialId, 'qty_out' => $qty, 'balance_after' => $stockBalance->quantity],
                "Stock Out issued for material {$material->material_number}: -{$qty} {$material->uom}"
            );

            return $transaction;
        });
    }

    public function stockAdjustment(
        int $materialId,
        float $targetQty,
        string $reason,
        User $user
    ): StockTransaction {
        if ($targetQty < 0) {
            throw new Exception('Target stock quantity cannot be negative.');
        }

        return DB::transaction(function () use ($materialId, $targetQty, $reason, $user) {
            $material = Material::findOrFail($materialId);

            $stockBalance = StockBalance::where('material_id', $materialId)
                ->lockForUpdate()
                ->first();

            if (! $stockBalance) {
                $stockBalance = StockBalance::create(['material_id' => $materialId, 'quantity' => 0]);
                $stockBalance = StockBalance::where('material_id', $materialId)->lockForUpdate()->first();
            }

            $oldBalance = (float) $stockBalance->quantity;
            $diff = $targetQty - $oldBalance;

            $stockBalance->quantity = $targetQty;
            $stockBalance->save();

            $transaction = StockTransaction::create([
                'material_id' => $materialId,
                'transaction_type' => StockTransactionType::ADJUSTMENT,
                'reference_type' => 'STOCK_ADJUSTMENT',
                'reference_id' => null,
                'reference_no' => 'ADJ-'.time(),
                'qty_in' => $diff > 0 ? $diff : 0,
                'qty_out' => $diff < 0 ? abs($diff) : 0,
                'balance_after' => $targetQty,
                'supplier' => null,
                'storage_location' => $material->storage_location,
                'reason' => $reason,
                'transaction_date' => now(),
                'user_id' => $user->id,
                'note' => "Adjusted from {$oldBalance} to {$targetQty}",
            ]);

            AuditService::log(
                $user,
                'ADJUSTMENT',
                'Inventory',
                'StockTransaction',
                (string) $transaction->id,
                ['balance_before' => $oldBalance],
                ['balance_after' => $targetQty, 'reason' => $reason],
                "Stock Adjustment for material {$material->material_number}: {$oldBalance} -> {$targetQty}"
            );

            return $transaction;
        });
    }

    public function stockReversal(
        int $materialId,
        float $qty,
        string $referenceNo,
        User $user,
        string $reason,
        string $referenceType = 'MATERIAL_REQUEST_CANCEL',
        ?string $referenceId = null
    ): StockTransaction {
        return DB::transaction(function () use ($materialId, $qty, $referenceNo, $user, $reason, $referenceType, $referenceId) {
            if ($referenceId) {
                $existingRev = StockTransaction::where('material_id', $materialId)
                    ->where('transaction_type', StockTransactionType::REVERSAL)
                    ->where('reference_type', $referenceType)
                    ->where('reference_id', $referenceId)
                    ->first();

                if ($existingRev) {
                    return $existingRev;
                }
            }

            $material = Material::findOrFail($materialId);

            $stockBalance = StockBalance::where('material_id', $materialId)
                ->lockForUpdate()
                ->firstOrFail();

            $stockBalance->quantity += $qty;
            $stockBalance->save();

            $transaction = StockTransaction::create([
                'material_id' => $materialId,
                'transaction_type' => StockTransactionType::REVERSAL,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'reference_no' => $referenceNo,
                'qty_in' => $qty,
                'qty_out' => 0,
                'balance_after' => $stockBalance->quantity,
                'supplier' => null,
                'storage_location' => $material->storage_location,
                'reason' => $reason,
                'transaction_date' => now(),
                'user_id' => $user->id,
                'note' => "Reversal due to cancellation: +{$qty}",
            ]);

            AuditService::log(
                $user,
                'REVERSAL',
                'Inventory',
                'StockTransaction',
                (string) $transaction->id,
                null,
                ['material_id' => $materialId, 'qty_reversed' => $qty, 'balance_after' => $stockBalance->quantity],
                "Stock Reversal for material {$material->material_number}: +{$qty} returned to stock"
            );

            return $transaction;
        });
    }
}
