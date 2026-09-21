<?php

namespace Tests\Feature;

use App\Enums\MaterialRequestStatus;
use App\Enums\StockTransactionType;
use App\Models\Department;
use App\Models\Material;
use App\Models\MaterialCategory;
use App\Models\Plant;
use App\Models\Role;
use App\Models\StockBalance;
use App\Models\StockTransaction;
use App\Models\User;
use App\Services\ApprovalService;
use App\Services\InventoryService;
use App\Services\MaterialRequestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MaterialRequestTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $approver;

    protected User $user;

    protected Material $material;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'ADMIN']);
        $approverRole = Role::create(['name' => 'APPROVER']);
        $userRole = Role::create(['name' => 'USER']);

        $dept = Department::create(['code' => 'DEPT-01', 'name' => 'Operations']);
        $plant = Plant::create(['code' => 'PLR-01', 'name' => 'Pulau Laut Refinery']);

        $this->admin = User::create([
            'employee_id' => 'EMP-001',
            'username' => 'admin',
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
            'department_id' => $dept->id,
            'plant_id' => $plant->id,
        ]);

        $this->approver = User::create([
            'employee_id' => 'EMP-002',
            'username' => 'approver',
            'name' => 'Approver HoD',
            'email' => 'approver@test.com',
            'password' => Hash::make('password'),
            'role_id' => $approverRole->id,
            'department_id' => $dept->id,
            'plant_id' => $plant->id,
        ]);

        $this->user = User::create([
            'employee_id' => 'EMP-003',
            'username' => 'user',
            'name' => 'Requester User',
            'email' => 'user@test.com',
            'password' => Hash::make('password'),
            'role_id' => $userRole->id,
            'approver_id' => $this->approver->id,
            'department_id' => $dept->id,
            'plant_id' => $plant->id,
        ]);

        $cat = MaterialCategory::create(['code' => 'CAT-01', 'name' => 'General']);
        $this->material = Material::create([
            'material_number' => 'MAT-TEST-1',
            'description' => 'Test Valve 2 inch',
            'category_id' => $cat->id,
            'uom' => 'PCS',
            'minimum_stock' => 5,
            'maximum_stock' => 50,
        ]);

        StockBalance::create(['material_id' => $this->material->id, 'quantity' => 100]);
    }

    public function test_request_number_generation_format(): void
    {
        $service = new MaterialRequestService;
        $reqNo = $service->generateRequestNumber();

        $year = date('Y');
        $this->assertStringStartsWith("MR-{$year}-", $reqNo);
    }

    public function test_user_can_create_draft_and_submit_request(): void
    {
        $mrService = new MaterialRequestService;

        $draft = $mrService->createDraft($this->user, [
            'reason' => 'Testing Requisition',
            'approver_id' => $this->approver->id,
        ], [
            ['material_id' => $this->material->id, 'qty' => 10, 'note' => 'Test Item'],
        ]);

        $this->assertEquals(MaterialRequestStatus::DRAFT, $draft->status);
        $this->assertEquals(1, $draft->items->count());
        $this->assertEquals(10, $draft->items->first()->qty);
        $this->assertEquals(90, $draft->items->first()->balance); // SOH 100 - 10 = 90

        $submitted = $mrService->submitRequest($draft, $this->user);
        $this->assertEquals(MaterialRequestStatus::PENDING_APPROVAL, $submitted->status);
    }

    public function test_approver_can_approve_request(): void
    {
        $mrService = new MaterialRequestService;
        $approvalService = new ApprovalService;

        $draft = $mrService->createDraft($this->user, [
            'approver_id' => $this->approver->id,
        ], [
            ['material_id' => $this->material->id, 'qty' => 5],
        ]);

        $submitted = $mrService->submitRequest($draft, $this->user);

        $approved = $approvalService->approve($submitted, $this->approver, 'Approved by HoD');
        $this->assertEquals(MaterialRequestStatus::APPROVED, $approved->status);
        $this->assertEquals(1, $approved->approvalHistories->count());
        $this->assertEquals('APPROVED', $approved->approvalHistories->first()->action);
    }

    public function test_self_approval_is_strictly_forbidden(): void
    {
        $this->expectException(\Exception::class);

        $approvalService = new ApprovalService;
        $mrService = new MaterialRequestService;

        $draft = $mrService->createDraft($this->user, ['approver_id' => $this->user->id], [
            ['material_id' => $this->material->id, 'qty' => 2],
        ]);
        $submitted = $mrService->submitRequest($draft, $this->user);

        // Attempt self-approval
        $approvalService->approve($submitted, $this->user);
    }

    public function test_admin_cancel_approved_request_triggers_stock_reversal(): void
    {
        $mrService = new MaterialRequestService;
        $approvalService = new ApprovalService;
        $inventoryService = new InventoryService;

        $draft = $mrService->createDraft($this->user, ['approver_id' => $this->approver->id], [
            ['material_id' => $this->material->id, 'qty' => 20],
        ]);
        $submitted = $mrService->submitRequest($draft, $this->user);
        $approved = $approvalService->approve($submitted, $this->approver);

        // Issue stock out (SOH goes from 100 -> 80)
        $inventoryService->stockOut($this->material->id, 20, $approved->request_no, $this->admin, 'MATERIAL_REQUEST', (string) $approved->id);
        $this->assertEquals(80, $this->material->fresh()->soh);

        // Admin cancels request -> Automatic Stock Reversal returns stock (80 -> 100)
        $mrService->cancelApprovedRequest($approved, $this->admin, 'User cancelled pickup', $inventoryService);

        $this->assertEquals(MaterialRequestStatus::CANCELLED_AFTER_APPROVAL, $approved->fresh()->status);
        $this->assertEquals(100, $this->material->fresh()->soh);

        $reversalTx = StockTransaction::where('transaction_type', StockTransactionType::REVERSAL)->first();
        $this->assertNotNull($reversalTx);
        $this->assertEquals(20, $reversalTx->qty_in);
    }

    public function test_admin_can_approve_and_reject_request(): void
    {
        $mrService = new MaterialRequestService;

        $draft = $mrService->createDraft($this->user, [
            'approver_id' => $this->approver->id,
        ], [
            ['material_id' => $this->material->id, 'qty' => 5],
        ]);
        $submitted = $mrService->submitRequest($draft, $this->user);

        // Admin approves request
        $response = $this->actingAs($this->admin)->post("/approvals/{$submitted->id}/approve", [
            'reason' => 'Admin Approval Note',
        ]);

        $response->assertRedirect();
        $this->assertEquals(MaterialRequestStatus::APPROVED, $submitted->fresh()->status);

        // Create another request and Admin rejects it
        $draft2 = $mrService->createDraft($this->user, [
            'approver_id' => $this->approver->id,
        ], [
            ['material_id' => $this->material->id, 'qty' => 3],
        ]);
        $submitted2 = $mrService->submitRequest($draft2, $this->user);

        $response2 = $this->actingAs($this->admin)->post("/approvals/{$submitted2->id}/reject", [
            'rejection_reason' => 'Admin Reject Reason',
        ]);

        $response2->assertRedirect();
        $this->assertEquals(MaterialRequestStatus::REJECTED, $submitted2->fresh()->status);
    }

    public function test_admin_can_edit_request_header_and_items_list(): void
    {
        $mrService = new MaterialRequestService;

        $draft = $mrService->createDraft($this->user, [
            'approver_id' => $this->approver->id,
            'gl_account' => '111111',
            'reason' => 'Old Reason',
        ], [
            ['material_id' => $this->material->id, 'qty' => 5],
        ]);

        $response = $this->actingAs($this->admin)->put("/requests/{$draft->id}", [
            'request_date' => now()->toDateString(),
            'no_doc' => 'DOC-ADMIN-99',
            'gl_account' => '999999',
            'pwo_no' => 'PWO-ADMIN-1',
            'pur_org' => '1000',
            'pur_group' => '001',
            'cost_center' => 'CC-ADMIN',
            'reason' => 'Updated by Admin',
            'approver_id' => $this->approver->id,
            'items' => [
                ['material_id' => $this->material->id, 'qty' => 15, 'note' => 'Updated Qty by Admin'],
            ],
        ]);

        $response->assertRedirect("/requests/{$draft->id}");
        $updated = $draft->fresh(['items']);

        $this->assertEquals('DOC-ADMIN-99', $updated->no_doc);
        $this->assertEquals('999999', $updated->gl_account);
        $this->assertEquals('PWO-ADMIN-1', $updated->pwo_no);
        $this->assertEquals('Updated by Admin', $updated->reason);
        $this->assertEquals(1, $updated->items->count());
        $this->assertEquals(15, $updated->items->first()->qty);
    }
}
