<?php

namespace Tests\Feature;

use App\Enums\MaterialRequestStatus;
use App\Models\ApprovalHistory;
use App\Models\Department;
use App\Models\Material;
use App\Models\MaterialCategory;
use App\Models\MaterialRequest;
use App\Models\MaterialRequestItem;
use App\Models\Plant;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MaterialRequestPdfTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $requester;

    private User $approver;

    private User $otherUser;

    private Department $department;

    private Plant $plant;

    private MaterialCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'ADMIN', 'display_name' => 'Administrator']);
        $userRole = Role::create(['name' => 'USER', 'display_name' => 'User']);
        $approverRole = Role::create(['name' => 'APPROVER', 'display_name' => 'Approver']);

        $this->department = Department::create(['name' => 'Engineering', 'code' => 'ENG']);
        $this->plant = Plant::create(['name' => 'Pulau Laut Refinery', 'code' => 'PLR']);
        $this->category = MaterialCategory::create(['name' => 'Spare Parts', 'code' => 'SP']);

        $this->admin = User::factory()->create([
            'role_id' => $adminRole->id,
            'department_id' => $this->department->id,
            'plant_id' => $this->plant->id,
        ]);

        $this->approver = User::factory()->create([
            'role_id' => $approverRole->id,
            'department_id' => $this->department->id,
            'plant_id' => $this->plant->id,
            'name' => 'Manager Approver',
        ]);

        $this->requester = User::factory()->create([
            'role_id' => $userRole->id,
            'department_id' => $this->department->id,
            'plant_id' => $this->plant->id,
            'approver_id' => $this->approver->id,
            'name' => 'John Requester',
            'employee_id' => 'EMP-1001',
            'position' => 'Senior Technician',
        ]);

        $otherDept = Department::create(['name' => 'Finance', 'code' => 'FIN']);
        $this->otherUser = User::factory()->create([
            'role_id' => $userRole->id,
            'department_id' => $otherDept->id,
            'plant_id' => $this->plant->id,
        ]);
    }

    private function createMaterial(string $number, string $description = 'Test Material'): Material
    {
        return Material::create([
            'material_number' => $number,
            'description' => $description,
            'category_id' => $this->category->id,
            'uom' => 'PCS',
            'minimum_stock' => 5,
            'maximum_stock' => 100,
            'plant_id' => $this->plant->id,
            'status' => 'ACTIVE',
        ]);
    }

    public function test_user_can_download_own_mr_pdf(): void
    {
        $material = $this->createMaterial('MAT-9901', 'Ball Bearing 6205');

        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-000101',
            'no_doc' => 'DOC-001',
            'request_date' => now()->toDateString(),
            'requester_id' => $this->requester->id,
            'department_id' => $this->department->id,
            'plant_id' => $this->plant->id,
            'status' => MaterialRequestStatus::SUBMITTED,
            'reason' => 'Maintenance requirements',
        ]);

        MaterialRequestItem::create([
            'request_id' => $mr->id,
            'material_id' => $material->id,
            'description' => 'Ball Bearing 6205',
            'qty' => 5,
            'uom' => 'PCS',
            'soh' => 10,
            'balance' => 5,
        ]);

        $response = $this->actingAs($this->requester)->get("/requests/{$mr->id}/pdf");

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        $response->assertHeader('Content-Disposition', 'attachment; filename="MR-2026-000101.pdf"');
        $this->assertNotEmpty($response->getContent());
    }

    public function test_pdf_renders_multiple_items_and_approval_history(): void
    {
        $mat1 = $this->createMaterial('MAT-001', 'First Material');
        $mat2 = $this->createMaterial('MAT-002', 'Second Material');

        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-000202',
            'request_date' => now()->toDateString(),
            'requester_id' => $this->requester->id,
            'department_id' => $this->department->id,
            'plant_id' => $this->plant->id,
            'approver_id' => $this->approver->id,
            'approved_at' => now(),
            'status' => MaterialRequestStatus::APPROVED,
        ]);

        MaterialRequestItem::create([
            'request_id' => $mr->id,
            'material_id' => $mat1->id,
            'description' => 'First Material',
            'qty' => 10,
            'uom' => 'LTR',
            'soh' => 20,
            'balance' => 10,
        ]);

        MaterialRequestItem::create([
            'request_id' => $mr->id,
            'material_id' => $mat2->id,
            'description' => 'Second Material',
            'qty' => 2,
            'uom' => 'BOX',
            'soh' => 5,
            'balance' => 3,
        ]);

        ApprovalHistory::create([
            'request_id' => $mr->id,
            'approver_id' => $this->approver->id,
            'action' => 'APPROVED',
            'reason' => 'Approved by manager',
            'action_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)->get("/requests/{$mr->id}/pdf");

        $response->assertStatus(200);
        $this->assertNotEmpty($response->getContent());
    }

    public function test_pdf_handles_rejected_status_and_reason(): void
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-000303',
            'request_date' => now()->toDateString(),
            'requester_id' => $this->requester->id,
            'department_id' => $this->department->id,
            'plant_id' => $this->plant->id,
            'approver_id' => $this->approver->id,
            'rejected_at' => now(),
            'rejection_reason' => 'Budget limit exceeded',
            'status' => MaterialRequestStatus::REJECTED,
        ]);

        $response = $this->actingAs($this->approver)->get("/requests/{$mr->id}/pdf");

        $response->assertStatus(200);
        $this->assertNotEmpty($response->getContent());
    }

    public function test_pdf_handles_null_optional_fields(): void
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-000404',
            'request_date' => now()->toDateString(),
            'requester_id' => $this->requester->id,
            'department_id' => $this->department->id,
            'plant_id' => $this->plant->id,
            'status' => MaterialRequestStatus::DRAFT,
            'no_doc' => null,
            'gl_account' => null,
            'pwo_no' => null,
            'pur_org' => null,
            'pur_group' => null,
            'cost_center' => null,
            'reason' => null,
        ]);

        $response = $this->actingAs($this->requester)->get("/requests/{$mr->id}/pdf");

        $response->assertStatus(200);
        $this->assertNotEmpty($response->getContent());
    }

    public function test_unauthorized_user_cannot_download_other_user_pdf(): void
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-000505',
            'request_date' => now()->toDateString(),
            'requester_id' => $this->requester->id,
            'department_id' => $this->department->id,
            'plant_id' => $this->plant->id,
            'status' => MaterialRequestStatus::SUBMITTED,
        ]);

        $response = $this->actingAs($this->otherUser)->get("/requests/{$mr->id}/pdf");

        $response->assertStatus(403);
    }
}
