<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'ADMIN',    'description' => 'Administrator dengan akses penuh ke seluruh sistem', 'is_active' => true],
            ['name' => 'APPROVER', 'description' => 'Head of Department / Executive Approver', 'is_active' => true],
            ['name' => 'USER',     'description' => 'Requester / Field Technician', 'is_active' => true],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['name' => $role['name']],
                array_merge($role, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
