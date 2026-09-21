<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['code' => 'PRC', 'name' => 'Procurement',          'is_active' => true],
            ['code' => 'MNT', 'name' => 'Maintenance',          'is_active' => true],
            ['code' => 'ENG', 'name' => 'Engineering',          'is_active' => true],
            ['code' => 'PRD', 'name' => 'Production',           'is_active' => true],
            ['code' => 'WH',  'name' => 'Warehouse',            'is_active' => true],
            ['code' => 'LOG', 'name' => 'Logistics',            'is_active' => true],
            ['code' => 'FIN', 'name' => 'Finance',              'is_active' => true],
            ['code' => 'HR',  'name' => 'Human Resources',      'is_active' => true],
            ['code' => 'IT',  'name' => 'Information Technology', 'is_active' => true],
            ['code' => 'HSE', 'name' => 'Health Safety Environment', 'is_active' => true],
            ['code' => 'QA',  'name' => 'Quality Assurance',    'is_active' => true],
            ['code' => 'PLN', 'name' => 'Planning',             'is_active' => true],
            ['code' => 'OPS', 'name' => 'Operations',           'is_active' => true],
            ['code' => 'ELC', 'name' => 'Electrical',           'is_active' => true],
            ['code' => 'MEC', 'name' => 'Mechanical',           'is_active' => true],
        ];

        foreach ($departments as $dept) {
            DB::table('departments')->updateOrInsert(
                ['code' => $dept['code']],
                array_merge($dept, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
