<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StockBalanceSeeder extends Seeder
{
    public function run(): void
    {
        // Only seed ACTIVE materials
        $materials = DB::table('materials')
            ->where('status', 'ACTIVE')
            ->select('id', 'minimum_stock', 'maximum_stock')
            ->get();

        $now = now()->toDateTimeString();
        $inserts = [];
        $index = 0;

        foreach ($materials as $mat) {
            $min = (float) $mat->minimum_stock;
            $max = (float) $mat->maximum_stock;

            // Stock distribution: 70% NORMAL, 20% LOW STOCK, 10% OUT OF STOCK
            $roll = $index % 10;

            if ($roll === 9) {
                // OUT OF STOCK
                $qty = 0;
            } elseif ($roll >= 7) {
                // LOW STOCK: 0 < qty <= minimum_stock
                $qty = $min > 0 ? mt_rand(1, (int) $min) : 0;
            } else {
                // NORMAL: qty > minimum_stock
                $lowerBound = (int) $min + 1;
                $upperBound = max($lowerBound + 1, (int) $max);
                $qty = mt_rand($lowerBound, $upperBound);
            }

            $inserts[] = [
                'material_id' => $mat->id,
                'quantity' => $qty,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            $index++;
        }

        // Upsert in batches
        $chunks = array_chunk($inserts, 300);
        foreach ($chunks as $chunk) {
            foreach ($chunk as $row) {
                DB::table('stock_balances')->updateOrInsert(
                    ['material_id' => $row['material_id']],
                    $row
                );
            }
        }

        $total = DB::table('stock_balances')->count();
        $this->command->info("StockBalanceSeeder: {$total} stock balances seeded.");

        // Summary breakdown
        $allBalances = DB::table('stock_balances')
            ->join('materials', 'materials.id', '=', 'stock_balances.material_id')
            ->select('stock_balances.quantity', 'materials.minimum_stock')
            ->get();

        $normal = 0;
        $low = 0;
        $outOfStk = 0;
        foreach ($allBalances as $b) {
            $qty = (float) $b->quantity;
            $min = (float) $b->minimum_stock;
            if ($qty <= 0) {
                $outOfStk++;
            } elseif ($qty <= $min) {
                $low++;
            } else {
                $normal++;
            }
        }
        $this->command->info("  NORMAL: {$normal}, LOW STOCK: {$low}, OUT OF STOCK: {$outOfStk}");
    }
}
