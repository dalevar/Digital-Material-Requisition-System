<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MaterialCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['code' => 'CAT-BRG', 'name' => 'Bearing',               'is_active' => true],
            ['code' => 'CAT-FST', 'name' => 'Fastener',              'is_active' => true],
            ['code' => 'CAT-ELC', 'name' => 'Electrical',            'is_active' => true],
            ['code' => 'CAT-MEC', 'name' => 'Mechanical',            'is_active' => true],
            ['code' => 'CAT-PIP', 'name' => 'Piping',                'is_active' => true],
            ['code' => 'CAT-VLV', 'name' => 'Valve',                 'is_active' => true],
            ['code' => 'CAT-LUB', 'name' => 'Lubricant',             'is_active' => true],
            ['code' => 'CAT-SAF', 'name' => 'Safety Equipment',      'is_active' => true],
            ['code' => 'CAT-HND', 'name' => 'Hand Tools',            'is_active' => true],
            ['code' => 'CAT-PWR', 'name' => 'Power Tools',           'is_active' => true],
            ['code' => 'CAT-INS', 'name' => 'Instrumentation',       'is_active' => true],
            ['code' => 'CAT-CBL', 'name' => 'Cable',                 'is_active' => true],
            ['code' => 'CAT-PMP', 'name' => 'Pump Parts',            'is_active' => true],
            ['code' => 'CAT-MTR', 'name' => 'Motor Parts',           'is_active' => true],
            ['code' => 'CAT-FLT', 'name' => 'Filter',                'is_active' => true],
            ['code' => 'CAT-SLR', 'name' => 'Seal',                  'is_active' => true],
            ['code' => 'CAT-GSK', 'name' => 'Gasket',                'is_active' => true],
            ['code' => 'CAT-WRK', 'name' => 'Workshop',              'is_active' => true],
            ['code' => 'CAT-CLN', 'name' => 'Cleaning',              'is_active' => true],
            ['code' => 'CAT-GEN', 'name' => 'General Material',      'is_active' => true],
        ];

        foreach ($categories as $cat) {
            DB::table('material_categories')->updateOrInsert(
                ['code' => $cat['code']],
                array_merge($cat, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
