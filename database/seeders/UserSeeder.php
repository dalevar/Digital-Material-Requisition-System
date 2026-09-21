<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRoleId = DB::table('roles')->where('name', 'ADMIN')->value('id');
        $approverRoleId = DB::table('roles')->where('name', 'APPROVER')->value('id');
        $userRoleId = DB::table('roles')->where('name', 'USER')->value('id');

        $deptIds = DB::table('departments')->pluck('id')->toArray();
        $plantIds = DB::table('plants')->pluck('id')->toArray();

        $now = now();

        // ----------------------------------------------------------------
        // 1. Fixed development accounts (upsert by username)
        // ----------------------------------------------------------------
        DB::table('users')->updateOrInsert(
            ['username' => 'admin'],
            [
                'employee_id' => 'EMP-000001',
                'name' => 'System Administrator',
                'email' => 'admin@dmrs.local',
                'password' => Hash::make('admin'),
                'department_id' => $deptIds[8], // IT
                'plant_id' => $plantIds[0],
                'role_id' => $adminRoleId,
                'position' => 'IT Admin / System Control Lead',
                'status' => 'ACTIVE',
                'approver_id' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        DB::table('users')->updateOrInsert(
            ['username' => 'admin2'],
            [
                'employee_id' => 'EMP-000002',
                'name' => 'Rudi Administrator',
                'email' => 'admin2@dmrs.local',
                'password' => Hash::make('admin'),
                'department_id' => $deptIds[4], // WH
                'plant_id' => $plantIds[1],
                'role_id' => $adminRoleId,
                'position' => 'Senior Stock Administrator',
                'status' => 'ACTIVE',
                'approver_id' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        // ----------------------------------------------------------------
        // 2. Approvers (20 users, EMP-000003 to EMP-000022)
        // ----------------------------------------------------------------
        $approverPositions = [
            'Head of Department Maintenance',
            'Head of Department Engineering',
            'Head of Department Production',
            'Head of Department Operations',
            'Head of Department Procurement',
            'Head of Department Warehouse',
            'Head of Department Logistics',
            'Head of Department Finance',
            'Head of Department HR',
            'Head of Department HSE',
            'Head of Department Quality',
            'Head of Department Planning',
            'Head of Department Electrical',
            'Head of Department Mechanical',
            'Senior Manager Operations',
            'Plant Manager',
            'Maintenance Supervisor',
            'Engineering Supervisor',
            'Production Supervisor',
            'Warehouse Supervisor',
        ];

        $approverNames = [
            'Budi Santoso',      'Agus Prasetyo',    'Hendra Wijaya',     'Siti Rahayu',
            'Bambang Supriadi',  'Eko Handoyo',      'Dewi Kusuma',       'Yusuf Habibi',
            'Rina Safitri',      'Doni Kurniawan',   'Lestari Putri',     'Wahyu Nugroho',
            'Fajar Setiawan',    'Nur Hasanah',      'Tri Wibowo',        'Ratna Sari',
            'Andika Pratama',    'Fitri Astuti',     'Joko Sumarno',      'Indah Permata',
        ];

        $approverInserts = [];
        for ($i = 0; $i < 4; $i++) {
            $empNum = str_pad($i + 3, 6, '0', STR_PAD_LEFT);
            $userNum = str_pad($i + 1, 3, '0', STR_PAD_LEFT);

            $approverInserts[] = [
                'employee_id' => "EMP-{$empNum}",
                'username' => "approver{$userNum}",
                'name' => $approverNames[$i],
                'email' => "approver{$userNum}@dmrs.local",
                'password' => Hash::make('password'),
                'department_id' => $deptIds[$i % count($deptIds)],
                'plant_id' => $plantIds[$i % count($plantIds)],
                'role_id' => $approverRoleId,
                'approver_id' => null,
                'position' => $approverPositions[$i],
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Also upsert the legacy 'approver' account
        DB::table('users')->updateOrInsert(
            ['username' => 'approver'],
            array_merge($approverInserts[0], ['username' => 'approver', 'email' => 'approver@dmrs.local'])
        );

        // Insert approvers (skip if employee_id already exists)
        foreach ($approverInserts as $a) {
            DB::table('users')->updateOrInsert(
                ['employee_id' => $a['employee_id']],
                $a
            );
        }

        // Collect approver IDs from DB
        $approverIds = DB::table('users')
            ->where('role_id', $approverRoleId)
            ->pluck('id')
            ->toArray();

        // ----------------------------------------------------------------
        // 3. Regular users
        // ----------------------------------------------------------------
        $userNames = [
            'Ahmad Fauzi',       'Bintang Ramadhan',  'Citra Dewi',       'Dian Puspita',
            'Eko Prasetyo',      'Fitra Nugraha',     'Gilang Santoso',   'Hani Safira',
            'Ivan Maulana',      'Joko Widodo',       'Kiki Andriani',    'Luki Firmansyah',
            'Maya Putri',
        ];

        $userPositions = [
            'Field Technician',          'Senior Field Technician',   'Maintenance Technician',
            'Electrical Technician',     'Mechanical Technician',     'Production Operator',
            'Warehouse Staff',           'Logistics Coordinator',     'Procurement Staff',
        ];

        $userInserts = [];
        for ($i = 0; $i < 12; $i++) {
            $empNum = str_pad($i + 23, 6, '0', STR_PAD_LEFT);
            $userNum = str_pad($i + 1, 3, '0', STR_PAD_LEFT);
            $nameIdx = $i % count($userNames);

            $userInserts[] = [
                'employee_id' => "EMP-{$empNum}",
                'username' => "user{$userNum}",
                'name' => $userNames[$nameIdx],
                'email' => "user{$userNum}@dmrs.local",
                'password' => Hash::make('password'),
                'department_id' => $deptIds[$i % count($deptIds)],
                'plant_id' => $plantIds[$i % count($plantIds)],
                'role_id' => $userRoleId,
                'approver_id' => $approverIds[$i % count($approverIds)],
                'position' => $userPositions[$i % count($userPositions)],
                'status' => ($i < 70) ? 'ACTIVE' : 'INACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Also upsert the legacy 'user' account
        DB::table('users')->updateOrInsert(
            ['username' => 'user'],
            array_merge($userInserts[0], [
                'username' => 'user',
                'employee_id' => 'EMP-000099',
                'email' => 'user@dmrs.local',
                'password' => Hash::make('password'),
                'status' => 'ACTIVE',
            ])
        );

        // Insert regular users (skip if employee_id already exists)
        foreach ($userInserts as $u) {
            DB::table('users')->updateOrInsert(
                ['employee_id' => $u['employee_id']],
                $u
            );
        }

        $this->command->info('UserSeeder: '.DB::table('users')->count().' users seeded.');
    }
}
