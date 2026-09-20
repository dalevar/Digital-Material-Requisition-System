<?php

namespace Tests\Feature;

use App\Enums\MaterialRequestStatus;
use App\Enums\StockTransactionType;
use App\Exceptions\InsufficientStockException;
use App\Exceptions\InvalidRequestStateException;
use App\Models\Department;
use App\Models\Material;
use App\Models\MaterialCategory;
use App\Models\MaterialRequest;
use App\Models\MaterialRequestItem;
use App\Models\Plant;
use App\Models\Role;
use App\Models\StockBalance;
use App\Models\User;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminInventoryRevisionTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $requester;

    private Material $materialA;

    private Material $materialB;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'ADMIN', 'description' => 'Administrator']);
        $userRole = Role::create(['name' => 'USER', 'description' => 'Requester']);

        $dept = Department::create(['code' => 'DEPT-01', 'name' => 'Engineering', 'is_active' => true]);
        $plant = Plant::create(['code' => 'PLR-01', 'name' => 'Refinery Plant', 'is_active' => true]);

        $this->admin = User::create([
            'employee_id' => 'EMP-001',
            'username' => 'admin',
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role_id' => $adminRole->id,
            'department_id' => $dept->id,
            'plant_id' => $plant->id,
            'status' => 'ACTIVE',
        ]);

        $this->requester = User::create([
            'employee_id' => 'EMP-002',
            'username' => 'requester',
            'name' => 'Requester User',
            'email' => 'requester@example.com',
            'password' => bcrypt('password'),
            'role_id' => $userRole->id,
            'department_id' => $dept->id,
            'plant_id' => $plant->id,
            'status' => 'ACTIVE',
        ]);

        $category = MaterialCategory::create(['code' => 'CAT-01', 'name' => 'Mechanical', 'is_active' => true]);

        $this->materialA = Material::create([
            'material_number' => 'MAT-1001',
            'description' => 'Bearing 6205',
            'category_id' => $category->id,
            'uom' => 'PCS',
            'minimum_stock' => 5,
            'maximum_stock' => 100,
            'storage_location' => 'RACK-A',
            'plant_id' => $plant->id,
            'status' => 'ACTIVE',
        ]);

        $this->materialB = Material::create([
            'material_number' => 'MAT-1002',
            'description' => 'Bolt M12',
            'category_id' => $category->id,
            'uom' => 'PCS',
            'minimum_stock' => 10,
            'maximum_stock' => 200,
            'storage_location' => 'RACK-B',
            'plant_id' => $plant->id,
            'status' => 'ACTIVE',
        ]);

        StockBalance::create(['material_id' => $this->materialA->id, 'quantity' => 20]);
        StockBalance::create(['material_id' => $this->materialB->id, 'quantity' => 50]);
    }

    public function test_admin_can_process_stock_out_atomically()
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-000001',
            'request_date' => now(),
            'requester_id' => $this->requester->id,
            'department_id' => $this->requester->department_id,
            'plant_id' => $this->requester->plant_id,
            'status' => MaterialRequestStatus::APPROVED,
        ]);

        MaterialRequestItem::create([
            'request_id' => $mr->id,
            'material_id' => $this->materialA->id,
            'description' => $this->materialA->description,
            'qty' => 5,
            'uom' => 'PCS',
            'soh' => 20,
            'balance' => 15,
        ]);

        MaterialRequestItem::create([
            'request_id' => $mr->id,
            'material_id' => $this->materialB->id,
            'description' => $this->materialB->description,
            'qty' => 10,
            'uom' => 'PCS',
            'soh' => 50,
            'balance' => 40,
        ]);

        $service = app(InventoryService::class);
        $service->issueRequestStock($mr, $this->admin);

        $mr->refresh();
        $this->assertEquals(MaterialRequestStatus::COMPLETED, $mr->status);

        $this->assertEquals(15, StockBalance::where('material_id', $this->materialA->id)->first()->quantity);
        $this->assertEquals(40, StockBalance::where('material_id', $this->materialB->id)->first()->quantity);

        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $this->materialA->id,
            'transaction_type' => StockTransactionType::STOCK_OUT->value,
            'reference_no' => 'MR-2026-000001',
            'qty_out' => 5,
            'balance_after' => 15,
        ]);

        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $this->materialB->id,
            'transaction_type' => StockTransactionType::STOCK_OUT->value,
            'reference_no' => 'MR-2026-000001',
            'qty_out' => 10,
            'balance_after' => 40,
        ]);
    }

    public function test_insufficient_stock_causes_complete_rollback()
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-000002',
            'request_date' => now(),
            'requester_id' => $this->requester->id,
            'department_id' => $this->requester->department_id,
            'plant_id' => $this->requester->plant_id,
            'status' => MaterialRequestStatus::APPROVED,
        ]);

        // Item 1 has sufficient stock (5 requested out of 20)
        MaterialRequestItem::create([
            'request_id' => $mr->id,
            'material_id' => $this->materialA->id,
            'description' => $this->materialA->description,
            'qty' => 5,
            'uom' => 'PCS',
        ]);

        // Item 2 has INSUFFICIENT stock (100 requested out of 50 available)
        MaterialRequestItem::create([
            'request_id' => $mr->id,
            'material_id' => $this->materialB->id,
            'description' => $this->materialB->description,
            'qty' => 100,
            'uom' => 'PCS',
        ]);

        $service = app(InventoryService::class);

        $this->expectException(InsufficientStockException::class);

        try {
            $service->issueRequestStock($mr, $this->admin);
        } finally {
            // Verify no stock was deducted from Material A (atomic rollback)
            $this->assertEquals(20, StockBalance::where('material_id', $this->materialA->id)->first()->quantity);
            $this->assertEquals(50, StockBalance::where('material_id', $this->materialB->id)->first()->quantity);
            $this->assertEquals(MaterialRequestStatus::APPROVED, $mr->fresh()->status);
        }
    }

    public function test_completed_request_cannot_be_processed_again()
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-000003',
            'request_date' => now(),
            'requester_id' => $this->requester->id,
            'status' => MaterialRequestStatus::COMPLETED,
        ]);

        $service = app(InventoryService::class);

        $this->expectException(InvalidRequestStateException::class);
        $service->issueRequestStock($mr, $this->admin);
    }

    public function test_stock_in_increases_soh()
    {
        $service = app(InventoryService::class);
        $service->stockIn($this->materialA->id, 30, 'PO-999', $this->admin, 'Supplier X', 'RACK-A', 'Stock entry');

        $this->assertEquals(50, StockBalance::where('material_id', $this->materialA->id)->first()->quantity);

        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $this->materialA->id,
            'transaction_type' => StockTransactionType::STOCK_IN->value,
            'qty_in' => 30,
            'balance_after' => 50,
        ]);
    }

    public function test_stock_adjustment_calculates_delta_and_recalculates_authoritatively()
    {
        $service = app(InventoryService::class);
        // Current SOH is 20, target is 35 (positive diff +15)
        $service->stockAdjustment($this->materialA->id, 35, 'Stock take count discrepancy', $this->admin);

        $this->assertEquals(35, StockBalance::where('material_id', $this->materialA->id)->first()->quantity);

        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $this->materialA->id,
            'transaction_type' => StockTransactionType::ADJUSTMENT->value,
            'qty_in' => 15,
            'qty_out' => 0,
            'balance_after' => 35,
        ]);
    }

    public function test_non_admin_cannot_issue_stock()
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-000004',
            'request_date' => now(),
            'requester_id' => $this->requester->id,
            'status' => MaterialRequestStatus::APPROVED,
        ]);

        $response = $this->actingAs($this->requester)
            ->post("/admin/requests/{$mr->id}/issue-stock");

        $response->assertStatus(403);
    }
}
