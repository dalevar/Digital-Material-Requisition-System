<?php

namespace App\Services;

use App\Enums\StockTransactionType;
use App\Models\Material;
use App\Models\StockBalance;
use App\Models\StockTransaction;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\DB;

class InventoryService
{
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

            $stockBalance->quantity += $qty;
            $stockBalance->save();

            $transaction = StockTransaction::create([
                'material_id' => $materialId,
                'transaction_type' => StockTransactionType::STOCK_IN,
                'reference_type' => 'STOCK_IN_ENTRY',
                'reference_id' => null,
                'reference_no' => $referenceNo,
                'qty_in' => $qty,
                'qty_out' => 0,
                'balance_after' => $stockBalance->quantity,
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
                null,
                ['material_id' => $materialId, 'qty_in' => $qty, 'balance_after' => $stockBalance->quantity],
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
            // Idempotency check: prevent duplicate stock out execution for same reference
            if ($referenceId) {
                $existingTx = StockTransaction::where('material_id', $materialId)
                    ->where('transaction_type', StockTransactionType::STOCK_OUT)
                    ->where('reference_type', $referenceType)
                    ->where('reference_id', $referenceId)
                    ->first();

                if ($existingTx) {
                    return $existingTx; // Idempotent return
                }
            }

            $material = Material::findOrFail($materialId);

            $stockBalance = StockBalance::where('material_id', $materialId)
                ->lockForUpdate()
                ->first();

            $currentSoh = $stockBalance ? (float) $stockBalance->quantity : 0;

            if ($currentSoh < $qty) {
                throw new Exception("Insufficient stock for material {$material->material_number}. Available SOH: {$currentSoh}, Requested: {$qty}");
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
            // Idempotency check for reversal
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
