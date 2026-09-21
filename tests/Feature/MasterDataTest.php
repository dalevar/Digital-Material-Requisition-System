<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\MaterialCategory;
use App\Models\Plant;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterDataTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'ADMIN']);
        $userRole = Role::create(['name' => 'USER']);

        $this->admin = User::factory()->create(['role_id' => $adminRole->id]);
        $this->regularUser = User::factory()->create(['role_id' => $userRole->id]);
    }

    public function test_admin_can_view_create_and_update_department(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/departments');
        $response->assertStatus(200);

        $response = $this->actingAs($this->admin)->post('/admin/departments', [
            'code' => 'DEPT-TEST',
            'name' => 'Test Department',
            'is_active' => true,
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('departments', ['code' => 'DEPT-TEST', 'name' => 'Test Department']);

        $dept = Department::where('code', 'DEPT-TEST')->first();
        $response = $this->actingAs($this->admin)->put("/admin/departments/{$dept->id}", [
            'code' => 'DEPT-TEST-UPDATED',
            'name' => 'Updated Department',
            'is_active' => false,
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('departments', ['code' => 'DEPT-TEST-UPDATED', 'name' => 'Updated Department', 'is_active' => false]);
    }

    public function test_admin_can_view_create_and_update_plant(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/plants');
        $response->assertStatus(200);

        $response = $this->actingAs($this->admin)->post('/admin/plants', [
            'code' => 'PLANT-TEST',
            'name' => 'Test Plant Location',
            'location' => 'Kalimantan',
            'is_active' => true,
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('plants', ['code' => 'PLANT-TEST', 'name' => 'Test Plant Location']);

        $plant = Plant::where('code', 'PLANT-TEST')->first();
        $response = $this->actingAs($this->admin)->put("/admin/plants/{$plant->id}", [
            'code' => 'PLANT-TEST-UPDATED',
            'name' => 'Updated Plant Location',
            'location' => 'Sumatra',
            'is_active' => true,
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('plants', ['code' => 'PLANT-TEST-UPDATED', 'location' => 'Sumatra']);
    }

    public function test_admin_can_view_create_and_update_category(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin/categories');
        $response->assertStatus(200);

        $response = $this->actingAs($this->admin)->post('/admin/categories', [
            'code' => 'CAT-TEST',
            'name' => 'Test Category',
            'is_active' => true,
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('material_categories', ['code' => 'CAT-TEST', 'name' => 'Test Category']);

        $cat = MaterialCategory::where('code', 'CAT-TEST')->first();
        $response = $this->actingAs($this->admin)->put("/admin/categories/{$cat->id}", [
            'code' => 'CAT-TEST-UPDATED',
            'name' => 'Updated Category',
            'is_active' => true,
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('material_categories', ['code' => 'CAT-TEST-UPDATED']);
    }

    public function test_regular_user_cannot_manage_master_data(): void
    {
        $response = $this->actingAs($this->regularUser)->get('/admin/departments');
        $response->assertStatus(403);

        $response = $this->actingAs($this->regularUser)->post('/admin/departments', [
            'code' => 'HACK',
            'name' => 'Hack Dept',
            'is_active' => true,
        ]);
        $response->assertStatus(403);
    }
}
