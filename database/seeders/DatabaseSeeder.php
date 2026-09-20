<?php

namespace Database\Seeders;

use App\Enums\StockTransactionType;
use App\Models\Department;
use App\Models\Material;
use App\Models\MaterialCategory;
use App\Models\Plant;
use App\Models\Role;
use App\Models\StockBalance;
use App\Models\StockTransaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles
        $adminRole = Role::firstOrCreate(['name' => 'ADMIN'], ['description' => 'Administrator with full system access']);
        $approverRole = Role::firstOrCreate(['name' => 'APPROVER'], ['description' => 'Executive / HoD Approver']);
        $userRole = Role::firstOrCreate(['name' => 'USER'], ['description' => 'Requester User']);

        // 2. Departments
        $deptOps = Department::firstOrCreate(['code' => 'DEPT-OPS'], ['name' => 'Refinery Operations']);
        $deptMaint = Department::firstOrCreate(['code' => 'DEPT-MAINT'], ['name' => 'Maintenance & Engineering']);
        $deptWh = Department::firstOrCreate(['code' => 'DEPT-WH'], ['name' => 'Logistics & Warehouse']);

        // 3. Plants
        $plant01 = Plant::firstOrCreate(['code' => 'PLR-01'], ['name' => 'Pulau Laut Refinery', 'location' => 'Kota Baru, South Kalimantan']);

        // 4. Default Admin User
        $admin = User::firstOrCreate(
            ['username' => 'admin'],
            [
                'employee_id' => 'EMP-001',
                'name' => 'System Administrator',
                'email' => 'admin@guthrie.co.id',
                'password' => Hash::make('admin'),
                'department_id' => $deptWh->id,
                'plant_id' => $plant01->id,
                'role_id' => $adminRole->id,
                'position' => 'IT Admin / Stock Control Lead',
                'status' => 'ACTIVE',
            ]
        );

        // 5. Default Approver User (HoD)
        $approver = User::firstOrCreate(
            ['username' => 'approver'],
            [
                'employee_id' => 'EMP-002',
                'name' => 'Budi Santoso (HoD)',
                'email' => 'approver@guthrie.co.id',
                'password' => Hash::make('password'),
                'department_id' => $deptOps->id,
                'plant_id' => $plant01->id,
                'role_id' => $approverRole->id,
                'position' => 'Head of Department Operations',
                'status' => 'ACTIVE',
            ]
        );

        // 6. Default Requester User
        $user = User::firstOrCreate(
            ['username' => 'user'],
            [
                'employee_id' => 'EMP-003',
                'name' => 'Ahmad Requester',
                'email' => 'user@guthrie.co.id',
                'password' => Hash::make('password'),
                'department_id' => $deptOps->id,
                'plant_id' => $plant01->id,
                'role_id' => $userRole->id,
                'approver_id' => $approver->id,
                'position' => 'Senior Field Technician',
                'status' => 'ACTIVE',
            ]
        );

        // 7. Material Categories
        $catMech = MaterialCategory::firstOrCreate(['code' => 'CAT-MECH'], ['name' => 'Mechanical & Piping']);
        $catElec = MaterialCategory::firstOrCreate(['code' => 'CAT-ELEC'], ['name' => 'Electrical & Instrumentation']);
        $catSafety = MaterialCategory::firstOrCreate(['code' => 'CAT-SAFE'], ['name' => 'Safety & PPE']);
        $catChem = MaterialCategory::firstOrCreate(['code' => 'CAT-CHEM'], ['name' => 'Chemicals & Lubricants']);

        // 8. Sample Materials
        $materialsData = [
            [
                'material_number' => 'MAT-1001',
                'description' => 'Ball Valve 2 inch Stainless Steel 316',
                'category_id' => $catMech->id,
                'uom' => 'PCS',
                'minimum_stock' => 10,
                'maximum_stock' => 100,
                'storage_location' => 'RACK-A1-02',
                'plant_id' => $plant01->id,
                'initial_stock' => 50,
            ],
            [
                'material_number' => 'MAT-1002',
                'description' => 'Digital Pressure Gauge 0-10 Bar WIKA',
                'category_id' => $catElec->id,
                'uom' => 'PCS',
                'minimum_stock' => 5,
                'maximum_stock' => 50,
                'storage_location' => 'RACK-B2-05',
                'plant_id' => $plant01->id,
                'initial_stock' => 25,
            ],
            [
                'material_number' => 'MAT-1003',
                'description' => 'Safety Helmet Yellow MSA V-Gard',
                'category_id' => $catSafety->id,
                'uom' => 'PCS',
                'minimum_stock' => 20,
                'maximum_stock' => 200,
                'storage_location' => 'RACK-C1-01',
                'plant_id' => $plant01->id,
                'initial_stock' => 100,
            ],
            [
                'material_number' => 'MAT-1004',
                'description' => 'Industrial Lubricant Synthetic Heavy Duty Oil HD40',
                'category_id' => $catChem->id,
                'uom' => 'DRUM',
                'minimum_stock' => 3,
                'maximum_stock' => 30,
                'storage_location' => 'CHEM-STORE-01',
                'plant_id' => $plant01->id,
                'initial_stock' => 12,
            ],
        ];

        foreach ($materialsData as $data) {
            $initialStock = $data['initial_stock'];
            unset($data['initial_stock']);

            $mat = Material::firstOrCreate(['material_number' => $data['material_number']], $data);

            StockBalance::updateOrCreate(
                ['material_id' => $mat->id],
                ['quantity' => $initialStock]
            );

            StockTransaction::firstOrCreate(
                [
                    'material_id' => $mat->id,
                    'reference_no' => 'INIT-SEED-'.$mat->material_number,
                ],
                [
                    'transaction_type' => StockTransactionType::STOCK_IN,
                    'qty_in' => $initialStock,
                    'qty_out' => 0,
                    'balance_after' => $initialStock,
                    'supplier' => 'Initial Inventory Master',
                    'storage_location' => $mat->storage_location,
                    'reason' => 'Initial Stock Seeding',
                    'transaction_date' => now(),
                    'user_id' => $admin->id,
                    'note' => 'System Initial Seeding',
                ]
            );
        }
    }
}
