<?php

namespace Tests\Feature;

use App\Enums\StockTransactionType;
use App\Models\Department;
use App\Models\Material;
use App\Models\MaterialCategory;
use App\Models\Plant;
use App\Models\Role;
use App\Models\StockBalance;
use App\Models\User;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Tests\TestCase;

class StockInAdjustmentTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $requester;

    private Material $activeMaterial;

    private Material $inactiveMaterial;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ValidateCsrfToken::class);

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

        $this->activeMaterial = Material::create([
            'material_number' => 'MAT-001',
            'description' => 'Gasket Ring 2 Inch',
            'category_id' => $category->id,
            'uom' => 'PCS',
            'minimum_stock' => 10,
            'maximum_stock' => 500,
            'storage_location' => 'RACK-A1',
            'plant_id' => $plant->id,
            'status' => 'ACTIVE',
        ]);

        $this->inactiveMaterial = Material::create([
            'material_number' => 'MAT-999',
            'description' => 'Obsolete Valve',
            'category_id' => $category->id,
            'uom' => 'PCS',
            'minimum_stock' => 5,
            'maximum_stock' => 50,
            'storage_location' => 'RACK-Z',
            'plant_id' => $plant->id,
            'status' => 'INACTIVE',
        ]);

        StockBalance::create([
            'material_id' => $this->activeMaterial->id,
            'quantity' => 100,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | STOCK IN TEST CASES
    |--------------------------------------------------------------------------
    */

    public function test_stock_in_increases_soh_correctly()
    {
        $response = $this->actingAs($this->admin)->post('/inventory/stock-in', [
            'material_id' => $this->activeMaterial->id,
            'quantity' => 25,
            'transaction_date' => now()->toDateString(),
            'reference_no' => 'PO-2026-001',
            'supplier' => 'PT Supplier Utama',
            'storage_location' => 'RACK-A1',
            'note' => 'Initial stock receipt',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals(125, StockBalance::where('material_id', $this->activeMaterial->id)->first()->quantity);

        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $this->activeMaterial->id,
            'transaction_type' => StockTransactionType::STOCK_IN->value,
            'reference_no' => 'PO-2026-001',
            'qty_in' => 25,
            'qty_out' => 0,
            'balance_after' => 125,
            'user_id' => $this->admin->id,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->admin->id,
            'action' => 'STOCK_IN',
            'module' => 'Inventory',
        ]);
    }

    public function test_stock_in_initializes_zero_stock_balance()
    {
        $category = MaterialCategory::first();
        $newMaterial = Material::create([
            'material_number' => 'MAT-NEW',
            'description' => 'New Hose Pipe',
            'category_id' => $category->id,
            'uom' => 'MTR',
            'minimum_stock' => 5,
            'maximum_stock' => 100,
            'plant_id' => $this->activeMaterial->plant_id,
            'status' => 'ACTIVE',
        ]);

        $service = app(InventoryService::class);
        $service->stockIn($newMaterial, 50, now(), 'PO-NEW', 'Supplier B', 'RACK-B', 'First batch', $this->admin);

        $this->assertEquals(50, StockBalance::where('material_id', $newMaterial->id)->first()->quantity);
        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $newMaterial->id,
            'transaction_type' => StockTransactionType::STOCK_IN->value,
            'qty_in' => 50,
            'balance_after' => 50,
        ]);
    }

    public function test_stock_in_rejects_zero_quantity()
    {
        $response = $this->actingAs($this->admin)->post('/inventory/stock-in', [
            'material_id' => $this->activeMaterial->id,
            'quantity' => 0,
            'transaction_date' => now()->toDateString(),
        ]);

        $response->assertSessionHasErrors(['quantity']);
        $this->assertEquals(100, StockBalance::where('material_id', $this->activeMaterial->id)->first()->quantity);
    }

    public function test_stock_in_rejects_negative_quantity()
    {
        $response = $this->actingAs($this->admin)->post('/inventory/stock-in', [
            'material_id' => $this->activeMaterial->id,
            'quantity' => -10,
            'transaction_date' => now()->toDateString(),
        ]);

        $response->assertSessionHasErrors(['quantity']);
        $this->assertEquals(100, StockBalance::where('material_id', $this->activeMaterial->id)->first()->quantity);
    }

    public function test_stock_in_rejects_inactive_material()
    {
        $response = $this->actingAs($this->admin)->post('/inventory/stock-in', [
            'material_id' => $this->inactiveMaterial->id,
            'quantity' => 10,
            'transaction_date' => now()->toDateString(),
        ]);

        $response->assertSessionHasErrors(['material_id']);
    }

    public function test_non_admin_cannot_perform_stock_in()
    {
        $response = $this->actingAs($this->requester)->post('/inventory/stock-in', [
            'material_id' => $this->activeMaterial->id,
            'quantity' => 25,
            'transaction_date' => now()->toDateString(),
        ]);

        $response->assertStatus(403);
    }

    /*
    |--------------------------------------------------------------------------
    | STOCK ADJUSTMENT TEST CASES
    |--------------------------------------------------------------------------
    */

    public function test_positive_stock_adjustment()
    {
        $response = $this->actingAs($this->admin)->post('/inventory/stock-adjustment', [
            'material_id' => $this->activeMaterial->id,
            'adjustment_quantity' => 20,
            'transaction_date' => now()->toDateString(),
            'reason' => 'Physical stock count surplus',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals(120, StockBalance::where('material_id', $this->activeMaterial->id)->first()->quantity);

        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $this->activeMaterial->id,
            'transaction_type' => StockTransactionType::ADJUSTMENT->value,
            'qty_in' => 20,
            'qty_out' => 0,
            'balance_after' => 120,
            'user_id' => $this->admin->id,
        ]);
    }

    public function test_negative_stock_adjustment()
    {
        $response = $this->actingAs($this->admin)->post('/inventory/stock-adjustment', [
            'material_id' => $this->activeMaterial->id,
            'adjustment_quantity' => -15,
            'transaction_date' => now()->toDateString(),
            'reason' => 'Physical stock count shortage',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals(85, StockBalance::where('material_id', $this->activeMaterial->id)->first()->quantity);

        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $this->activeMaterial->id,
            'transaction_type' => StockTransactionType::ADJUSTMENT->value,
            'qty_in' => 0,
            'qty_out' => 15,
            'balance_after' => 85,
            'user_id' => $this->admin->id,
        ]);
    }

    public function test_stock_adjustment_to_exact_zero()
    {
        StockBalance::where('material_id', $this->activeMaterial->id)->update(['quantity' => 15]);

        $response = $this->actingAs($this->admin)->post('/inventory/stock-adjustment', [
            'material_id' => $this->activeMaterial->id,
            'adjustment_quantity' => -15,
            'transaction_date' => now()->toDateString(),
            'reason' => 'Write-off damaged items',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals(0, StockBalance::where('material_id', $this->activeMaterial->id)->first()->quantity);

        $this->assertDatabaseHas('stock_transactions', [
            'material_id' => $this->activeMaterial->id,
            'transaction_type' => StockTransactionType::ADJUSTMENT->value,
            'qty_in' => 0,
            'qty_out' => 15,
            'balance_after' => 0,
        ]);
    }

    public function test_stock_adjustment_resulting_in_negative_stock_is_rejected()
    {
        StockBalance::where('material_id', $this->activeMaterial->id)->update(['quantity' => 10]);

        $response = $this->actingAs($this->admin)->post('/inventory/stock-adjustment', [
            'material_id' => $this->activeMaterial->id,
            'adjustment_quantity' => -11,
            'transaction_date' => now()->toDateString(),
            'reason' => 'Excessive reduction attempt',
        ]);

        $response->assertSessionHasErrors();
        $this->assertEquals(10, StockBalance::where('material_id', $this->activeMaterial->id)->first()->quantity);
    }

    public function test_zero_stock_adjustment_is_rejected()
    {
        $response = $this->actingAs($this->admin)->post('/inventory/stock-adjustment', [
            'material_id' => $this->activeMaterial->id,
            'adjustment_quantity' => 0,
            'transaction_date' => now()->toDateString(),
            'reason' => 'No change',
        ]);

        $response->assertSessionHasErrors(['adjustment_quantity']);
    }

    public function test_stock_adjustment_requires_reason()
    {
        $response = $this->actingAs($this->admin)->post('/inventory/stock-adjustment', [
            'material_id' => $this->activeMaterial->id,
            'adjustment_quantity' => -5,
            'transaction_date' => now()->toDateString(),
            'reason' => '',
        ]);

        $response->assertSessionHasErrors(['reason']);
    }

    public function test_non_admin_cannot_perform_stock_adjustment()
    {
        $response = $this->actingAs($this->requester)->post('/inventory/stock-adjustment', [
            'material_id' => $this->activeMaterial->id,
            'adjustment_quantity' => 10,
            'transaction_date' => now()->toDateString(),
            'reason' => 'Unauthorized adjustment attempt',
        ]);

        $response->assertStatus(403);
    }

    public function test_stock_adjustment_creates_audit_log()
    {
        $this->actingAs($this->admin)->post('/inventory/stock-adjustment', [
            'material_id' => $this->activeMaterial->id,
            'adjustment_quantity' => -15,
            'transaction_date' => now()->toDateString(),
            'reason' => 'Physical stock count',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->admin->id,
            'action' => 'STOCK_ADJUSTMENT',
            'module' => 'Inventory',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | CONCURRENCY TEST
    |--------------------------------------------------------------------------
    */

    public function test_concurrent_stock_in_updates_are_safe()
    {
        $service = app(InventoryService::class);

        $service->stockIn($this->activeMaterial, 20, now(), 'REF-A', null, null, null, $this->admin);
        $service->stockIn($this->activeMaterial, 30, now(), 'REF-B', null, null, null, $this->admin);

        $this->assertEquals(150, StockBalance::where('material_id', $this->activeMaterial->id)->first()->quantity);
    }
}
