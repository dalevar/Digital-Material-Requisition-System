<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MaterialRequestItemSeeder extends Seeder
{
    public function run(): void
    {
        $requests = DB::table('material_requests')
            ->select('id', 'status', 'created_at')
            ->get()
            ->toArray();

        $activeMaterials = DB::table('materials')
            ->where('status', 'ACTIVE')
            ->select('id', 'description', 'uom', 'minimum_stock')
            ->get()
            ->toArray();

        $stockBalances = DB::table('stock_balances')
            ->pluck('quantity', 'material_id')
            ->toArray();

        $matCount = count($activeMaterials);
        $itemNotes = [
            'Untuk keperluan maintenance rutin',
            'Urgent - diperlukan segera',
            'Stok hampir habis di lapangan',
            'Penggantian komponen yang rusak',
            'Untuk project shutdown planned',
            'Material cadangan (spare)',
            null,
            null,
            null,
        ];

        $allItems = [];
        $batchSize = 300;
        $matOffset = 0;

        // Item count distribution per request:
        // 20% = 1, 30% = 2-3, 30% = 4-5, 15% = 6-10, 5% = 11+
        $itemCountDistribution = [];
        foreach ($requests as $idx => $req) {
            $roll = $idx % 100;
            if ($roll < 20) {
                $count = 1;
            } elseif ($roll < 50) {
                $count = mt_rand(2, 3);
            } elseif ($roll < 80) {
                $count = mt_rand(4, 5);
            } elseif ($roll < 95) {
                $count = mt_rand(6, 10);
            } else {
                $count = mt_rand(11, 15);
            }
            $itemCountDistribution[$req->id] = $count;
        }

        foreach ($requests as $idx => $req) {
            $itemCount = $itemCountDistribution[$req->id];
            $usedMatIds = [];

            for ($j = 0; $j < $itemCount; $j++) {
                // Pick a material, avoid duplicates per request
                $attempts = 0;
                do {
                    $mat = $activeMaterials[($matOffset + $j + $attempts) % $matCount];
                    $attempts++;
                } while (in_array($mat->id, $usedMatIds) && $attempts < 20);

                $usedMatIds[] = $mat->id;

                $soh = (float) ($stockBalances[$mat->id] ?? 0);
                $qty = max(1, mt_rand(1, max(1, (int) ($mat->minimum_stock * 1.5))));
                $balance = $soh - $qty;

                $allItems[] = [
                    'request_id' => $req->id,
                    'material_id' => $mat->id,
                    'description' => $mat->description,
                    'qty' => $qty,
                    'uom' => $mat->uom,
                    'soh' => $soh,
                    'balance' => $balance,
                    'note' => $itemNotes[($idx + $j) % count($itemNotes)],
                    'created_at' => $req->created_at,
                    'updated_at' => $req->created_at,
                ];

                if (count($allItems) >= $batchSize) {
                    DB::table('material_request_items')->insert($allItems);
                    $allItems = [];
                }
            }

            $matOffset += $itemCount;
        }

        if (! empty($allItems)) {
            DB::table('material_request_items')->insert($allItems);
        }

        $total = DB::table('material_request_items')->count();
        $this->command->info("MaterialRequestItemSeeder: {$total} request items seeded.");
    }
}
