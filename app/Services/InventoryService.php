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
use Illuminate\Support\Carbon;
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
        Material|int $material,
        float $qty,
        Carbon|string|null $date = null,
        ?string $referenceNo = null,
        ?string $supplier = null,
        ?string $storageLocation = null,
        ?string $note = null,
        ?User $user = null
    ): StockTransaction {
        $materialModel = $material instanceof Material ? $material : Material::findOrFail($material);

        if ($materialModel->status !== 'ACTIVE') {
            throw new Exception("Material {$materialModel->material_number} is INACTIVE and cannot be used for Stock In.");
        }

        if ($qty <= 0) {
            throw new Exception('Stock In quantity must be greater than zero.');
        }

        $transactionDate = $date ? ($date instanceof Carbon ? $date : Carbon::parse($date)) : now();
        $user = $user ?? auth()->user();

        return DB::transaction(function () use ($materialModel, $qty, $transactionDate, $referenceNo, $supplier, $storageLocation, $note, $user) {
            $stockBalance = StockBalance::where('material_id', $materialModel->id)
                ->lockForUpdate()
                ->first();

            if (! $stockBalance) {
                $stockBalance = StockBalance::create([
                    'material_id' => $materialModel->id,
                    'quantity' => 0,
                ]);
                $stockBalance = StockBalance::where('material_id', $materialModel->id)->lockForUpdate()->first();
            }

            $oldBalance = (float) $stockBalance->quantity;
            $newBalance = $oldBalance + $qty;
            $stockBalance->quantity = $newBalance;
            $stockBalance->save();

            $transaction = StockTransaction::create([
                'material_id' => $materialModel->id,
                'transaction_type' => StockTransactionType::STOCK_IN,
                'reference_type' => 'STOCK_IN_ENTRY',
                'reference_id' => null,
                'reference_no' => $referenceNo,
                'qty_in' => $qty,
                'qty_out' => 0,
                'balance_after' => $newBalance,
                'supplier' => $supplier,
                'storage_location' => $storageLocation ?? $materialModel->storage_location,
                'reason' => 'Stock In Entry',
                'transaction_date' => $transactionDate,
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
                ['material_id' => $materialModel->id, 'qty_in' => $qty, 'balance_after' => $newBalance],
                "Stock In material {$materialModel->material_number} sebanyak {$qty} {$materialModel->uom}."
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
        Material|int $material,
        float $adjustmentQuantity,
        Carbon|string|null $date = null,
        string $reason = '',
        ?string $note = null,
        ?User $user = null
    ): StockTransaction {
        $materialModel = $material instanceof Material ? $material : Material::findOrFail($material);

        if ($materialModel->status !== 'ACTIVE') {
            throw new Exception("Material {$materialModel->material_number} is INACTIVE and cannot be used for Stock Adjustment.");
        }

        if (abs($adjustmentQuantity) < 0.00001) {
            throw new Exception('Adjustment quantity cannot be zero.');
        }

        if (empty(trim($reason))) {
            throw new Exception('Adjustment reason is required.');
        }

        $transactionDate = $date ? ($date instanceof Carbon ? $date : Carbon::parse($date)) : now();
        $user = $user ?? auth()->user();

        return DB::transaction(function () use ($materialModel, $adjustmentQuantity, $transactionDate, $reason, $note, $user) {
            $stockBalance = StockBalance::where('material_id', $materialModel->id)
                ->lockForUpdate()
                ->first();

            if (! $stockBalance) {
                $stockBalance = StockBalance::create(['material_id' => $materialModel->id, 'quantity' => 0]);
                $stockBalance = StockBalance::where('material_id', $materialModel->id)->lockForUpdate()->first();
            }

            $currentStock = (float) $stockBalance->quantity;
            $finalStock = $currentStock + $adjustmentQuantity;

            if ($finalStock < 0) {
                throw new Exception('Adjustment would result in negative stock.');
            }

            $stockBalance->quantity = $finalStock;
            $stockBalance->save();

            $qtyIn = $adjustmentQuantity > 0 ? $adjustmentQuantity : 0;
            $qtyOut = $adjustmentQuantity < 0 ? abs($adjustmentQuantity) : 0;

            $transaction = StockTransaction::create([
                'material_id' => $materialModel->id,
                'transaction_type' => StockTransactionType::ADJUSTMENT,
                'reference_type' => 'STOCK_ADJUSTMENT',
                'reference_id' => null,
                'reference_no' => 'ADJ-'.time(),
                'qty_in' => $qtyIn,
                'qty_out' => $qtyOut,
                'balance_after' => $finalStock,
                'supplier' => null,
                'storage_location' => $materialModel->storage_location,
                'reason' => $reason,
                'transaction_date' => $transactionDate,
                'user_id' => $user->id,
                'note' => $note ?? "Adjusted stock from {$currentStock} to {$finalStock}",
            ]);

            AuditService::log(
                $user,
                'STOCK_ADJUSTMENT',
                'Inventory',
                'StockTransaction',
                (string) $transaction->id,
                ['balance_before' => $currentStock],
                ['balance_after' => $finalStock, 'adjustment_quantity' => $adjustmentQuantity, 'reason' => $reason],
                "Stock adjustment material {$materialModel->material_number} dari {$currentStock} menjadi {$finalStock} {$materialModel->uom}. Reason: {$reason}"
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
