<?php

namespace Tests\Feature;

use App\Enums\MaterialRequestStatus;
use App\Models\Department;
use App\Models\MaterialRequest;
use App\Models\Plant;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApprovalInboxTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $approver1;

    protected User $approver2;

    protected User $regularUser;

    protected Department $dept1;

    protected Department $dept2;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'ADMIN']);
        $approverRole = Role::create(['name' => 'APPROVER']);
        $userRole = Role::create(['name' => 'USER']);

        $this->dept1 = Department::create(['code' => 'DEPT-01', 'name' => 'Operations']);
        $this->dept2 = Department::create(['code' => 'DEPT-02', 'name' => 'Maintenance']);
        $plant = Plant::create(['code' => 'PLR-01', 'name' => 'Pulau Laut Refinery']);

        $this->admin = User::create([
            'employee_id' => 'EMP-ADM-01',
            'username' => 'admin_user',
            'name' => 'Admin Test User',
            'email' => 'admin_test@test.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
            'department_id' => $this->dept1->id,
            'plant_id' => $plant->id,
        ]);

        $this->approver1 = User::create([
            'employee_id' => 'EMP-APP-01',
            'username' => 'approver_1',
            'name' => 'Approver One',
            'email' => 'approver1@test.com',
            'password' => Hash::make('password'),
            'role_id' => $approverRole->id,
            'department_id' => $this->dept1->id,
            'plant_id' => $plant->id,
        ]);

        $this->approver2 = User::create([
            'employee_id' => 'EMP-APP-02',
            'username' => 'approver_2',
            'name' => 'Approver Two',
            'email' => 'approver2@test.com',
            'password' => Hash::make('password'),
            'role_id' => $approverRole->id,
            'department_id' => $this->dept2->id,
            'plant_id' => $plant->id,
        ]);

        $this->regularUser = User::create([
            'employee_id' => 'EMP-USR-01',
            'username' => 'regular_user',
            'name' => 'Regular User',
            'email' => 'regular@test.com',
            'password' => Hash::make('password'),
            'role_id' => $userRole->id,
            'department_id' => $this->dept1->id,
            'plant_id' => $plant->id,
        ]);
    }

    public function test_admin_can_access_approval_inbox_and_sees_monitoring_data(): void
    {
        MaterialRequest::create([
            'request_no' => 'MR-2026-000010',
            'request_date' => '2026-03-15',
            'requester_id' => $this->regularUser->id,
            'department_id' => $this->dept1->id,
            'plant_id' => $this->regularUser->plant_id,
            'status' => MaterialRequestStatus::SUBMITTED,
            'approver_id' => $this->approver1->id,
        ]);

        $response = $this->actingAs($this->admin)->get('/approvals/inbox');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Approvals/Inbox')
            ->where('isAdminMonitoring', true)
            ->has('pendingRequests.data', 1)
        );
    }

    public function test_approver_sees_scoped_approval_inbox(): void
    {
        // Request assigned to Dept 1
        MaterialRequest::create([
            'request_no' => 'MR-2026-000011',
            'request_date' => '2026-03-15',
            'requester_id' => $this->regularUser->id,
            'department_id' => $this->dept1->id,
            'plant_id' => $this->regularUser->plant_id,
            'status' => MaterialRequestStatus::SUBMITTED,
            'approver_id' => $this->approver1->id,
        ]);

        // Request assigned to Dept 2
        MaterialRequest::create([
            'request_no' => 'MR-2026-000012',
            'request_date' => '2026-03-15',
            'requester_id' => $this->regularUser->id,
            'department_id' => $this->dept2->id,
            'plant_id' => $this->regularUser->plant_id,
            'status' => MaterialRequestStatus::SUBMITTED,
            'approver_id' => $this->approver2->id,
        ]);

        // Approver 1 sees only Dept 1 request
        $response1 = $this->actingAs($this->approver1)->get('/approvals/inbox');
        $response1->assertStatus(200);
        $response1->assertInertia(fn ($page) => $page
            ->where('isAdminMonitoring', false)
            ->where('pendingRequests.data.0.request_no', 'MR-2026-000011')
        );

        // Approver 2 sees only Dept 2 request
        $response2 = $this->actingAs($this->approver2)->get('/approvals/inbox');
        $response2->assertStatus(200);
        $response2->assertInertia(fn ($page) => $page
            ->where('isAdminMonitoring', false)
            ->where('pendingRequests.data.0.request_no', 'MR-2026-000012')
        );
    }

    public function test_admin_cannot_approve_request(): void
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-000013',
            'request_date' => '2026-03-15',
            'requester_id' => $this->regularUser->id,
            'department_id' => $this->dept1->id,
            'plant_id' => $this->regularUser->plant_id,
            'status' => MaterialRequestStatus::SUBMITTED,
            'approver_id' => $this->approver1->id,
        ]);

        $response = $this->actingAs($this->admin)->post("/approvals/{$mr->id}/approve", [
            'reason' => 'Admin trying to approve',
        ]);

        $response->assertStatus(403);
        $this->assertEquals(MaterialRequestStatus::SUBMITTED, $mr->fresh()->status);
    }

    public function test_admin_cannot_reject_request(): void
    {
        $mr = MaterialRequest::create([
            'request_no' => 'MR-2026-000014',
            'request_date' => '2026-03-15',
            'requester_id' => $this->regularUser->id,
            'department_id' => $this->dept1->id,
            'plant_id' => $this->regularUser->plant_id,
            'status' => MaterialRequestStatus::SUBMITTED,
            'approver_id' => $this->approver1->id,
        ]);

        $response = $this->actingAs($this->admin)->post("/approvals/{$mr->id}/reject", [
            'rejection_reason' => 'Admin trying to reject',
        ]);

        $response->assertStatus(403);
        $this->assertEquals(MaterialRequestStatus::SUBMITTED, $mr->fresh()->status);
    }

    public function test_unauthorized_user_cannot_access_approval_inbox(): void
    {
        $response = $this->actingAs($this->regularUser)->get('/approvals/inbox');
        $response->assertStatus(403);
    }
}
