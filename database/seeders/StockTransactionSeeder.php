<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class StockTransactionSeeder extends Seeder
{
    public function run(): void
    {
        $adminRoleId = DB::table('roles')->where('name', 'ADMIN')->value('id');
        $adminUsers = DB::table('users')
            ->where('role_id', $adminRoleId)
            ->pluck('id')
            ->toArray();

        $allUsers = DB::table('users')
            ->where('status', 'ACTIVE')
            ->pluck('id')
            ->toArray();

        $activeMaterials = DB::table('materials')
            ->where('status', 'ACTIVE')
            ->select('id', 'minimum_stock', 'maximum_stock', 'storage_location')
            ->get()
            ->toArray();

        $stockBalances = DB::table('stock_balances')
            ->pluck('quantity', 'material_id')
            ->toArray();

        // Requests that have PROCESSING or COMPLETED status for STOCK_OUT reference
        $processingRequests = DB::table('material_requests')
            ->whereIn('status', ['PROCESSING', 'COMPLETED'])
            ->select('id', 'request_no', 'created_at')
            ->get()
            ->toArray();

        // Requests that have CANCELLED_AFTER_APPROVAL for REVERSAL
        $cancelledRequests = DB::table('material_requests')
            ->where('status', 'CANCELLED_AFTER_APPROVAL')
            ->select('id', 'request_no')
            ->get()
            ->toArray();

        $suppliers = [
            'PT. Supplier Material Nusantara',
            'PT. Teknik Industri Mandiri',
            'PT. Sumber Energi Teknik',
            'PT. Prima Mechanical Supply',
            'PT. Global Industrial Supply',
            'PT. Karya Mekanik Sejahtera',
            'PT. Anugrah Teknik Persada',
            'PT. Sarana Industri Utama',
            'PT. Bintang Jaya Teknik',
            'PT. Mitra Solusi Teknik',
        ];

        $adjustmentReasons = [
            'Physical stock count - Stock opname bulanan',
            'Inventory reconciliation - penyesuaian sistem',
            'Damaged material - material rusak dikeluarkan',
            'Stock opname - hasil rekonsiliasi gudang',
            'System correction - koreksi input data',
            'Warehouse verification - verifikasi fisik',
            'Found excess stock during audit',
            'Material returned from field - kondisi baik',
        ];

        $startDate = Carbon::parse('2025-10-01');
        $endDate = Carbon::parse('2026-09-20');
        $matCount = count($activeMaterials);

        if ($matCount === 0) {
            $this->command->warn('No active materials found, skipping StockTransactionSeeder.');

            return;
        }

        $totalTarget = 10000;
        $allTransactions = [];
        $batchSize = 500;

        // ---------------------------------------------------------------
        // Phase 1: Initial STOCK_IN for all materials (historical setup)
        // ---------------------------------------------------------------
        $this->command->info('Phase 1: Initial stock-in transactions...');
        foreach ($activeMaterials as $mat) {
            $currentBalance = (float) ($stockBalances[$mat->id] ?? 0);
            // Create a historical initial stock-in 12 months ago
            $initDate = $startDate->copy()->addDays(mt_rand(0, 10))->toDateTimeString();
            $initQty = max(1, (int) ($currentBalance + mt_rand(5, 20)));

            $allTransactions[] = [
                'material_id' => $mat->id,
                'transaction_type' => 'STOCK_IN',
                'reference_type' => 'INIT',
                'reference_id' => null,
                'reference_no' => 'INIT-'.str_pad($mat->id, 6, '0', STR_PAD_LEFT),
                'qty_in' => $initQty,
                'qty_out' => 0,
                'balance_after' => $initQty,
                'supplier' => $suppliers[0],
                'storage_location' => $mat->storage_location,
                'reason' => 'Initial stock seeding',
                'transaction_date' => $initDate,
                'user_id' => $adminUsers[0],
                'note' => 'Initial inventory setup',
                'created_at' => $initDate,
                'updated_at' => $initDate,
            ];

            if (count($allTransactions) >= $batchSize) {
                DB::table('stock_transactions')->insert($allTransactions);
                $allTransactions = [];
            }
        }

        if (! empty($allTransactions)) {
            DB::table('stock_transactions')->insert($allTransactions);
            $allTransactions = [];
        }

        // ---------------------------------------------------------------
        // Phase 2: Realistic chronological transactions per material
        // Target: fill up to 10,000 total
        // ---------------------------------------------------------------
        $this->command->info('Phase 2: Generating bulk transactions...');
        $existingCount = DB::table('stock_transactions')->count();
        $remaining = $totalTarget - $existingCount;

        // Running balance tracker (simulate from 0 for realism)
        $runningBalances = [];
        foreach ($activeMaterials as $mat) {
            $runningBalances[$mat->id] = (float) ($stockBalances[$mat->id] ?? 0);
        }

        $txPerMat = max(1, (int) ($remaining / $matCount));
        $txGenerated = 0;

        foreach ($activeMaterials as $matIdx => $mat) {
            $balance = $runningBalances[$mat->id];
            $txCount = $txPerMat + ($matIdx % 3); // slight variation

            for ($t = 0; $t < $txCount; $t++) {
                if ($txGenerated >= $remaining) {
                    break 2;
                }

                // Chronological date within range
                $txDays = (int) (($txGenerated / max(1, $remaining)) * $startDate->diffInDays($endDate));
                $txDate = $startDate->copy()->addDays($txDays + mt_rand(0, 3));
                if ($txDate->gt($endDate)) {
                    $txDate = $endDate->copy();
                }
                $txDateStr = $txDate->toDateTimeString();

                // Determine transaction type by distribution:
                // STOCK_IN 35%, STOCK_OUT 45%, ADJUSTMENT 15%, REVERSAL 5%
                $roll = $txGenerated % 100;
                if ($roll < 35) {
                    $type = 'STOCK_IN';
                } elseif ($roll < 80) {
                    $type = 'STOCK_OUT';
                } elseif ($roll < 95) {
                    $type = 'ADJUSTMENT';
                } else {
                    $type = 'REVERSAL';
                }

                $qtyIn = 0;
                $qtyOut = 0;
                $supplier = null;
                $reason = null;
                $refType = null;
                $refNo = null;

                switch ($type) {
                    case 'STOCK_IN':
                        $qtyIn = mt_rand(10, 50);
                        $balance += $qtyIn;
                        $supplier = $suppliers[$txGenerated % count($suppliers)];
                        $refType = 'PURCHASE';
                        $refNo = 'PO-'.str_pad($txGenerated + 1, 6, '0', STR_PAD_LEFT);
                        $reason = 'Pembelian material dari supplier';
                        break;

                    case 'STOCK_OUT':
                        $maxOut = max(1, min((int) $balance, mt_rand(1, 15)));
                        $qtyOut = $maxOut;
                        $balance = max(0, $balance - $qtyOut);
                        $refType = 'REQUEST';
                        $refNo = 'MR-'.$txDate->year.'-'.str_pad(mt_rand(1, 999), 6, '0', STR_PAD_LEFT);
                        $reason = 'Pengeluaran material berdasarkan request';
                        break;

                    case 'ADJUSTMENT':
                        $adjAmt = mt_rand(1, 10);
                        // Positive or negative adjustment
                        if ($txGenerated % 3 !== 0) {
                            // Positive
                            $qtyIn = $adjAmt;
                            $balance += $adjAmt;
                        } else {
                            // Negative
                            $qtyOut = min($adjAmt, max(0, (int) $balance));
                            $balance = max(0, $balance - $qtyOut);
                        }
                        $reason = $adjustmentReasons[$txGenerated % count($adjustmentReasons)];
                        $refType = 'ADJUSTMENT';
                        $refNo = 'ADJ-'.str_pad($txGenerated + 1, 6, '0', STR_PAD_LEFT);
                        break;

                    case 'REVERSAL':
                        // Reversal returns qty to stock
                        $revQty = mt_rand(1, 10);
                        $qtyIn = $revQty;
                        $balance += $revQty;
                        $reason = 'Pengembalian material - request dibatalkan setelah approval';
                        $refType = 'REVERSAL';
                        $refNo = 'REV-'.str_pad($txGenerated + 1, 6, '0', STR_PAD_LEFT);
                        break;
                }

                $userId = $allUsers[$txGenerated % count($allUsers)];

                $allTransactions[] = [
                    'material_id' => $mat->id,
                    'transaction_type' => $type,
                    'reference_type' => $refType,
                    'reference_id' => null,
                    'reference_no' => $refNo,
                    'qty_in' => $qtyIn,
                    'qty_out' => $qtyOut,
                    'balance_after' => max(0, $balance),
                    'supplier' => $supplier,
                    'storage_location' => $mat->storage_location,
                    'reason' => $reason,
                    'transaction_date' => $txDateStr,
                    'user_id' => $userId,
                    'note' => null,
                    'created_at' => $txDateStr,
                    'updated_at' => $txDateStr,
                ];

                $txGenerated++;

                if (count($allTransactions) >= $batchSize) {
                    DB::table('stock_transactions')->insert($allTransactions);
                    $allTransactions = [];
                }
            }

            $runningBalances[$mat->id] = $balance;
        }

        // ---------------------------------------------------------------
        // Phase 3: STOCK_OUT linked to PROCESSING/COMPLETED requests
        // ---------------------------------------------------------------
        $this->command->info('Phase 3: Stock-out for processing/completed requests...');
        foreach ($processingRequests as $idx => $req) {
            if ($txGenerated >= $totalTarget) {
                break;
            }

            $reqDate = Carbon::parse($req->created_at)->addDays(mt_rand(1, 5))->toDateTimeString();
            $mat = $activeMaterials[$idx % $matCount];
            $balance = max(0, (float) ($runningBalances[$mat->id] ?? 5));
            $qtyOut = min((int) $balance, mt_rand(1, 10));
            $balance -= $qtyOut;

            $allTransactions[] = [
                'material_id' => $mat->id,
                'transaction_type' => 'STOCK_OUT',
                'reference_type' => 'REQUEST',
                'reference_id' => (string) $req->id,
                'reference_no' => $req->request_no,
                'qty_in' => 0,
                'qty_out' => max(1, $qtyOut),
                'balance_after' => max(0, $balance),
                'supplier' => null,
                'storage_location' => $mat->storage_location,
                'reason' => 'Pengeluaran material berdasarkan '.$req->request_no,
                'transaction_date' => $reqDate,
                'user_id' => $adminUsers[0],
                'note' => 'Stock out untuk request: '.$req->request_no,
                'created_at' => $reqDate,
                'updated_at' => $reqDate,
            ];

            $runningBalances[$mat->id] = $balance;
            $txGenerated++;

            if (count($allTransactions) >= $batchSize) {
                DB::table('stock_transactions')->insert($allTransactions);
                $allTransactions = [];
            }
        }

        // ---------------------------------------------------------------
        // Phase 4: STOCK_OUT then REVERSAL for CANCELLED_AFTER_APPROVAL
        // ---------------------------------------------------------------
        $this->command->info('Phase 4: Reversal transactions for cancelled-after-approval...');
        foreach ($cancelledRequests as $idx => $req) {
            if ($txGenerated >= $totalTarget) {
                break;
            }

            $mat = $activeMaterials[$idx % $matCount];
            $qtyOut = mt_rand(2, 8);
            $balance = max(0, (float) ($runningBalances[$mat->id] ?? 10));
            $afterOut = max(0, $balance - $qtyOut);

            $outDate = Carbon::parse('2026-01-01')->addDays($idx * 3 + mt_rand(0, 2))->toDateTimeString();
            $revDate = Carbon::parse($outDate)->addDays(mt_rand(3, 10))->toDateTimeString();

            // Stock Out
            $allTransactions[] = [
                'material_id' => $mat->id,
                'transaction_type' => 'STOCK_OUT',
                'reference_type' => 'REQUEST',
                'reference_id' => (string) $req->id,
                'reference_no' => $req->request_no,
                'qty_in' => 0,
                'qty_out' => $qtyOut,
                'balance_after' => $afterOut,
                'supplier' => null,
                'storage_location' => $mat->storage_location,
                'reason' => 'Pengeluaran material berdasarkan '.$req->request_no,
                'transaction_date' => $outDate,
                'user_id' => $adminUsers[0],
                'note' => 'Stock out (will be reversed)',
                'created_at' => $outDate,
                'updated_at' => $outDate,
            ];

            // Reversal
            $afterRev = $afterOut + $qtyOut;
            $allTransactions[] = [
                'material_id' => $mat->id,
                'transaction_type' => 'REVERSAL',
                'reference_type' => 'REQUEST',
                'reference_id' => (string) $req->id,
                'reference_no' => 'REV-'.$req->request_no,
                'qty_in' => $qtyOut,
                'qty_out' => 0,
                'balance_after' => $afterRev,
                'supplier' => null,
                'storage_location' => $mat->storage_location,
                'reason' => 'Reversal - request '.$req->request_no.' dibatalkan setelah approval',
                'transaction_date' => $revDate,
                'user_id' => $adminUsers[0],
                'note' => 'Pengembalian qty '.$qtyOut.' unit ke stok',
                'created_at' => $revDate,
                'updated_at' => $revDate,
            ];

            $runningBalances[$mat->id] = $afterRev;
            $txGenerated += 2;

            if (count($allTransactions) >= $batchSize) {
                DB::table('stock_transactions')->insert($allTransactions);
                $allTransactions = [];
            }
        }

        if (! empty($allTransactions)) {
            DB::table('stock_transactions')->insert($allTransactions);
        }

        $total = DB::table('stock_transactions')->count();
        $this->command->info("StockTransactionSeeder: {$total} stock transactions seeded.");
    }
}
