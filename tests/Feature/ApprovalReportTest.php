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

class ApprovalReportTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $approver;

    protected User $executive;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'ADMIN']);
        $approverRole = Role::create(['name' => 'APPROVER']);
        $executiveRole = Role::create(['name' => 'EXECUTIVE']);
        $userRole = Role::create(['name' => 'USER']);

        $dept = Department::create(['code' => 'DEPT-01', 'name' => 'Operations']);
        $plant = Plant::create(['code' => 'PLR-01', 'name' => 'Pulau Laut Refinery']);

        $this->admin = User::create([
            'employee_id' => 'EMP-ADM-01',
            'username' => 'admin_user',
            'name' => 'Admin Test User',
            'email' => 'admin_test@test.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
            'department_id' => $dept->id,
            'plant_id' => $plant->id,
        ]);

        $this->approver = User::create([
            'employee_id' => 'EMP-APP-01',
            'username' => 'approver_user',
            'name' => 'Approver Test User',
            'email' => 'approver_test@test.com',
            'password' => Hash::make('password'),
            'role_id' => $approverRole->id,
            'department_id' => $dept->id,
            'plant_id' => $plant->id,
        ]);

        $this->executive = User::create([
            'employee_id' => 'EMP-EXE-01',
            'username' => 'executive_user',
            'name' => 'Executive Test User',
            'email' => 'executive_test@test.com',
            'password' => Hash::make('password'),
            'role_id' => $executiveRole->id,
            'department_id' => $dept->id,
            'plant_id' => $plant->id,
        ]);

        $this->user = User::create([
            'employee_id' => 'EMP-USR-01',
            'username' => 'regular_user',
            'name' => 'Regular Test User',
            'email' => 'regular_test@test.com',
            'password' => Hash::make('password'),
            'role_id' => $userRole->id,
            'department_id' => $dept->id,
            'plant_id' => $plant->id,
        ]);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get('/reports/approvals');
        $response->assertRedirect('/login');

        $excelResponse = $this->get('/reports/approvals/excel');
        $excelResponse->assertRedirect('/login');
    }

    public function test_regular_user_is_forbidden(): void
    {
        $response = $this->actingAs($this->user)->get('/reports/approvals');
        $response->assertStatus(403);

        $excelResponse = $this->actingAs($this->user)->get('/reports/approvals/excel');
        $excelResponse->assertStatus(403);
    }

    public function test_admin_can_access_approval_report(): void
    {
        $response = $this->actingAs($this->admin)->get('/reports/approvals');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Reports/ApprovalReport')
            ->has('requests')
            ->has('filters')
            ->has('stats')
        );
    }

    public function test_approver_can_access_approval_report(): void
    {
        $response = $this->actingAs($this->approver)->get('/reports/approvals');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Reports/ApprovalReport')
            ->has('requests')
        );
    }

    public function test_executive_can_access_approval_report(): void
    {
        $response = $this->actingAs($this->executive)->get('/reports/approvals');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Reports/ApprovalReport')
            ->has('requests')
        );
    }

    public function test_filtering_by_status_and_dates_and_kpi_calculation(): void
    {
        // Seed test requests
        MaterialRequest::create([
            'request_no' => 'MR-2026-000001',
            'request_date' => '2026-01-10',
            'requester_id' => $this->user->id,
            'department_id' => $this->user->department_id,
            'plant_id' => $this->user->plant_id,
            'status' => MaterialRequestStatus::APPROVED,
            'approver_id' => $this->approver->id,
            'approved_at' => '2026-01-11 10:00:00',
        ]);

        MaterialRequest::create([
            'request_no' => 'MR-2026-000002',
            'request_date' => '2026-02-15',
            'requester_id' => $this->user->id,
            'department_id' => $this->user->department_id,
            'plant_id' => $this->user->plant_id,
            'status' => MaterialRequestStatus::REJECTED,
            'approver_id' => $this->approver->id,
            'rejected_at' => '2026-02-16 11:00:00',
            'rejection_reason' => 'Duplicate item request',
        ]);

        MaterialRequest::create([
            'request_no' => 'MR-2026-000003',
            'request_date' => '2026-03-01',
            'requester_id' => $this->user->id,
            'department_id' => $this->user->department_id,
            'plant_id' => $this->user->plant_id,
            'status' => MaterialRequestStatus::PENDING_APPROVAL,
            'approver_id' => $this->approver->id,
        ]);

        // Access page without filters
        $response = $this->actingAs($this->admin)->get('/reports/approvals');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('stats.totalCount', 3)
            ->where('stats.approvedCount', 1)
            ->where('stats.rejectedCount', 1)
            ->where('stats.pendingCount', 1)
        );

        // Access page with status filter APPROVED
        $filterStatusResponse = $this->actingAs($this->admin)->get('/reports/approvals?status=APPROVED');
        $filterStatusResponse->assertStatus(200);
        $filterStatusResponse->assertInertia(fn ($page) => $page
            ->where('stats.totalCount', 1)
            ->where('stats.approvedCount', 1)
            ->where('stats.rejectedCount', 0)
        );

        // Access page with date range filter (February only)
        $filterDateResponse = $this->actingAs($this->admin)->get('/reports/approvals?date_from=2026-02-01&date_to=2026-02-28');
        $filterDateResponse->assertStatus(200);
        $filterDateResponse->assertInertia(fn ($page) => $page
            ->where('stats.totalCount', 1)
            ->where('stats.rejectedCount', 1)
        );
    }

    public function test_approval_report_excel_export(): void
    {
        MaterialRequest::create([
            'request_no' => 'MR-2026-000001',
            'request_date' => '2026-01-10',
            'requester_id' => $this->user->id,
            'department_id' => $this->user->department_id,
            'plant_id' => $this->user->plant_id,
            'status' => MaterialRequestStatus::APPROVED,
            'approver_id' => $this->approver->id,
            'approved_at' => '2026-01-11 10:00:00',
        ]);

        $response = $this->actingAs($this->admin)->get('/reports/approvals/excel');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
}
