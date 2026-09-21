<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlantSeeder extends Seeder
{
    public function run(): void
    {
        $plants = [
            ['code' => 'PLT-001', 'name' => 'Pulau Laut Refinery',      'location' => 'Kota Baru, South Kalimantan',  'is_active' => true],
            ['code' => 'PLT-002', 'name' => 'Warehouse Central',         'location' => 'Banjarmasin, South Kalimantan', 'is_active' => true],
            ['code' => 'PLT-003', 'name' => 'Maintenance Area',          'location' => 'Kota Baru, South Kalimantan',  'is_active' => true],
            ['code' => 'PLT-004', 'name' => 'Production Area',           'location' => 'Pulau Laut, South Kalimantan', 'is_active' => true],
            ['code' => 'PLT-005', 'name' => 'Utility Area',              'location' => 'Pulau Laut, South Kalimantan', 'is_active' => true],
        ];

        foreach ($plants as $plant) {
            DB::table('plants')->updateOrInsert(
                ['code' => $plant['code']],
                array_merge($plant, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
