<?php

namespace Tests\Feature;

use App\Enums\MaterialRequestStatus;
use App\Enums\StockTransactionType;
use App\Models\Department;
use App\Models\Material;
use App\Models\MaterialCategory;
use App\Models\MaterialRequest;
use App\Models\MaterialRequestItem;
use App\Models\Plant;
use App\Models\Role;
use App\Models\StockBalance;
use App\Models\StockTransaction;
use App\Models\User;
use App\Services\InventoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAccessAlignmentTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $approver;

    protected User $regularUser;

    protected Department $dept;

    protected Plant $plant;

    protected MaterialCategory $cat;

    protected Material $material;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'ADMIN']);
        $approverRole = Role::create(['name' => 'APPROVER']);
        $userRole = Role::create(['name' => 'USER']);

        $this->dept = Department::create(['code' => 'DEPT-TEST', 'name' => 'Test Operations']);
        $this->plant = Plant::create(['code' => 'PLR-01', 'name' => 'Pulau Laut Refinery']);

        $this->admin = User::create([
            'employee_id' => 'EMP-ADM-99',
            'username' => 'admin_test_alignment',
            'name' => 'Admin Alignment User',
            'email' => 'admin_align@test.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
            'department_id' => $this->dept->id,
            'plant_id' => $this->plant->id,
            'status' => 'ACTIVE',
        ]);

        $this->approver = User::create([
            'employee_id' => 'EMP-APP-99',
            'username' => 'approver_test_alignment',
            'name' => 'Approver Alignment User',
            'email' => 'approver_align@test.com',
            'password' => Hash::make('password'),
            'role_id' => $approverRole->id,
            'department_id' => $this->dept->id,
            'plant_id' => $this->plant->id,
            'status' => 'ACTIVE',
        ]);

        $this->regularUser = User::create([
            'employee_id' => 'EMP-USR-99',
            'username' => 'user_test_alignment',
            'name' => 'Regular Alignment User',
            'email' => 'user_align@test.com',
            'password' => Hash::make('password'),
            'role_id' => $userRole->id,
            'department_id' => $this->dept->id,
            'plant_id' => $this->plant->id,
            'approver_id' => $this->approver->id,
            'status' => 'ACTIVE',
        ]);

        $this->cat = MaterialCategory::create(['code' => 'CAT-01', 'name' => 'General Spareparts']);

        $this->material = Material::create([
            'material_number' => 'MAT-AL-001',
            'description' => 'Test Alignment Material',
            'category_id' => $this->cat->id,
            'uom' => 'PCS',
            'minimum_stock' => 5,
            'maximum_stock' => 50,
            'storage_location' => 'RACK-A1',
            'plant_id' => $this->plant->id,
            'status' => 'ACTIVE',
        ]);

        StockBalance::create([
            'material_id' => $this->material->id,
            'quantity' => 100,
        ]);
    }

    /** Test 1 — Admin sees all requests */
    public function test_admin_sees_all_requests(): void
    {
        MaterialRequest::create([
            'request_no' => 'MR-2026-900001',
            'request_date' => '2026-03-20',
            'requester_id' => $this->regularUser->id,
            'department_id' => $this->dept->id,
            'plant_id' => $this->plant->id,
            'status' => MaterialRequestStatus::SUBMITTED,
            'approver_id' => $this->approver->id,
        ]);

        $response = $this->actingAs($this->admin)->get('/requests');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Requests/Index')
            ->has('requests.data', 1)
        );
    }

    /** Test 2 — Admin can approve request */
    public function test_admin_can_approve_request(): void
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-900002',
            'request_date' => '2026-03-20',
            'requester_id' => $this->regularUser->id,
            'department_id' => $this->dept->id,
            'plant_id' => $this->plant->id,
            'status' => MaterialRequestStatus::SUBMITTED,
            'approver_id' => $this->approver->id,
        ]);

        $response = $this->actingAs($this->admin)->post("/approvals/{$mr->id}/approve", [
            'reason' => 'Admin approval note',
        ]);

        $response->assertRedirect();
        $this->assertEquals(MaterialRequestStatus::APPROVED, $mr->fresh()->status);
    }

    /** Test 3 — Admin can reject request */
    public function test_admin_can_reject_request(): void
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-900003',
            'request_date' => '2026-03-20',
            'requester_id' => $this->regularUser->id,
            'department_id' => $this->dept->id,
            'plant_id' => $this->plant->id,
            'status' => MaterialRequestStatus::SUBMITTED,
            'approver_id' => $this->approver->id,
        ]);

        $response = $this->actingAs($this->admin)->post("/approvals/{$mr->id}/reject", [
            'rejection_reason' => 'Admin rejection reason',
        ]);

        $response->assertRedirect();
        $this->assertEquals(MaterialRequestStatus::REJECTED, $mr->fresh()->status);
    }

    /** Test 4 — Assigned Approver can approve */
    public function test_assigned_approver_can_approve(): void
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-900004',
            'request_date' => '2026-03-20',
            'requester_id' => $this->regularUser->id,
            'department_id' => $this->dept->id,
            'plant_id' => $this->plant->id,
            'status' => MaterialRequestStatus::SUBMITTED,
            'approver_id' => $this->approver->id,
        ]);

        $response = $this->actingAs($this->approver)->post("/approvals/{$mr->id}/approve", [
            'reason' => 'Approved by assigned HoD',
        ]);

        $response->assertRedirect();
        $this->assertEquals(MaterialRequestStatus::APPROVED, $mr->fresh()->status);
    }

    /** Test 5 — Admin can edit allowed fields on APPROVED request */
    public function test_admin_can_edit_allowed_fields_on_approved_request(): void
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-900005',
            'request_date' => '2026-03-20',
            'requester_id' => $this->regularUser->id,
            'department_id' => $this->dept->id,
            'plant_id' => $this->plant->id,
            'status' => MaterialRequestStatus::APPROVED,
            'approver_id' => $this->approver->id,
            'gl_account' => '510001',
        ]);

        $response = $this->actingAs($this->admin)->patch("/admin/requests/{$mr->id}/supplement", [
            'gl_account' => '510002',
            'pwo_no' => 'PWO-100',
            'cost_center' => 'CC-900',
            'no_doc' => 'DOC-REF-55',
            'reason' => 'Updated GL and Cost Center according to accounting guidance',
        ]);

        $response->assertRedirect();
        $fresh = $mr->fresh();
        $this->assertEquals('510002', $fresh->gl_account);
        $this->assertEquals('PWO-100', $fresh->pwo_no);
        $this->assertEquals('CC-900', $fresh->cost_center);
        $this->assertEquals('DOC-REF-55', $fresh->no_doc);
    }

    /** Test 6 — Change reason is mandatory when editing approved MRF */
    public function test_change_reason_is_mandatory_when_editing_approved_mrf(): void
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-900006',
            'request_date' => '2026-03-20',
            'requester_id' => $this->regularUser->id,
            'department_id' => $this->dept->id,
            'plant_id' => $this->plant->id,
            'status' => MaterialRequestStatus::APPROVED,
            'approver_id' => $this->approver->id,
        ]);

        $response = $this->actingAs($this->admin)->patch("/admin/requests/{$mr->id}/supplement", [
            'gl_account' => '510002',
            'reason' => '',
        ]);

        $response->assertSessionHasErrors('reason');
    }

    /** Test 7 — Audit log is created when Admin edits approved MRF */
    public function test_audit_log_created_on_admin_approved_mrf_edit(): void
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-900007',
            'request_date' => '2026-03-20',
            'requester_id' => $this->regularUser->id,
            'department_id' => $this->dept->id,
            'plant_id' => $this->plant->id,
            'status' => MaterialRequestStatus::APPROVED,
            'approver_id' => $this->approver->id,
            'gl_account' => '510001',
        ]);

        $this->actingAs($this->admin)->patch("/admin/requests/{$mr->id}/supplement", [
            'gl_account' => '510009',
            'reason' => 'Accounting adjustment audit test',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->admin->id,
            'action' => 'SUPPLEMENT_MRF',
            'record_id' => (string) $mr->id,
        ]);
    }

    /** Test 8 — Original approval history remains unchanged when Admin edits approved MRF */
    public function test_original_approval_history_remains_unchanged(): void
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-900008',
            'request_date' => '2026-03-20',
            'requester_id' => $this->regularUser->id,
            'department_id' => $this->dept->id,
            'plant_id' => $this->plant->id,
            'status' => MaterialRequestStatus::APPROVED,
            'approver_id' => $this->approver->id,
        ]);

        $mr->approvalHistories()->create([
            'approver_id' => $this->approver->id,
            'action' => 'APPROVED',
            'reason' => 'Approved by HoD Budi',
            'action_at' => now()->subHour(),
        ]);

        $historyCountBefore = $mr->approvalHistories()->count();

        $this->actingAs($this->admin)->patch("/admin/requests/{$mr->id}/supplement", [
            'gl_account' => '510099',
            'reason' => 'Admin supplement update',
        ]);

        $this->assertEquals($historyCountBefore, $mr->fresh()->approvalHistories()->count());
        $this->assertEquals('Approved by HoD Budi', $mr->fresh()->approvalHistories()->first()->reason);
    }

    /** Test 9 — Admin cancellation before STOCK_OUT (stock unchanged, no REVERSAL) */
    public function test_admin_cancellation_before_stock_out(): void
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-900009',
            'request_date' => '2026-03-20',
            'requester_id' => $this->regularUser->id,
            'department_id' => $this->dept->id,
            'plant_id' => $this->plant->id,
            'status' => MaterialRequestStatus::APPROVED,
            'approver_id' => $this->approver->id,
        ]);

        MaterialRequestItem::create([
            'request_id' => $mr->id,
            'material_id' => $this->material->id,
            'description' => $this->material->description,
            'qty' => 10,
            'uom' => 'PCS',
            'soh' => 100,
            'balance' => 90,
        ]);

        $initialStock = StockBalance::where('material_id', $this->material->id)->first()->quantity;

        $response = $this->actingAs($this->admin)->post("/admin/requests/{$mr->id}/cancel", [
            'cancellation_reason' => 'User cancelled pickup before issue',
        ]);

        $response->assertRedirect();
        $this->assertEquals(MaterialRequestStatus::CANCELLED_AFTER_APPROVAL, $mr->fresh()->status);
        $this->assertEquals($initialStock, StockBalance::where('material_id', $this->material->id)->first()->quantity);

        $reversalTx = StockTransaction::where('reference_id', (string) $mr->id)
            ->where('transaction_type', StockTransactionType::REVERSAL)
            ->first();
        $this->assertNull($reversalTx);
    }

    /** Test 10 — Admin cancellation after STOCK_OUT (REVERSAL created, stock restored, original STOCK_OUT preserved) */
    public function test_admin_cancellation_after_stock_out(): void
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-900010',
            'request_date' => '2026-03-20',
            'requester_id' => $this->regularUser->id,
            'department_id' => $this->dept->id,
            'plant_id' => $this->plant->id,
            'status' => MaterialRequestStatus::APPROVED,
            'approver_id' => $this->approver->id,
        ]);

        $item = MaterialRequestItem::create([
            'request_id' => $mr->id,
            'material_id' => $this->material->id,
            'description' => $this->material->description,
            'qty' => 15,
            'uom' => 'PCS',
            'soh' => 100,
            'balance' => 85,
        ]);

        // Execute Stock Out via InventoryService
        /** @var InventoryService $inventoryService */
        $inventoryService = app(InventoryService::class);
        $inventoryService->stockOut(
            $this->material->id,
            15,
            $mr->request_no,
            $this->admin,
            'MATERIAL_REQUEST',
            (string) $mr->id,
            'Stock issued'
        );

        $stockAfterIssue = StockBalance::where('material_id', $this->material->id)->first()->quantity;
        $this->assertEquals(85, $stockAfterIssue);

        // Verify original STOCK_OUT transaction exists
        $stockOutTx = StockTransaction::where('reference_id', (string) $mr->id)
            ->where('transaction_type', StockTransactionType::STOCK_OUT)
            ->first();
        $this->assertNotNull($stockOutTx);

        // Now Admin cancels after STOCK_OUT
        $response = $this->actingAs($this->admin)->post("/admin/requests/{$mr->id}/cancel", [
            'cancellation_reason' => 'Material damaged after issue, return to stock',
        ]);

        $response->assertRedirect();
        $this->assertEquals(MaterialRequestStatus::CANCELLED_AFTER_APPROVAL, $mr->fresh()->status);

        // Verify stock is restored
        $stockAfterCancel = StockBalance::where('material_id', $this->material->id)->first()->quantity;
        $this->assertEquals(100, $stockAfterCancel);

        // Verify original STOCK_OUT remains preserved in history
        $this->assertDatabaseHas('stock_transactions', [
            'id' => $stockOutTx->id,
            'transaction_type' => StockTransactionType::STOCK_OUT->value,
        ]);

        // Verify REVERSAL transaction was created
        $this->assertDatabaseHas('stock_transactions', [
            'reference_id' => (string) $mr->id,
            'transaction_type' => StockTransactionType::REVERSAL->value,
            'qty_in' => 15,
        ]);
    }
}
