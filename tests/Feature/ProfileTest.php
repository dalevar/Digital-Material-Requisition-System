<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_profile_page(): void
    {
        $role = Role::create(['name' => 'USER']);
        $user = User::factory()->create(['role_id' => $role->id]);

        $response = $this->actingAs($user)->get('/profile');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Profile/Show')
            ->has('userProfile')
        );
    }

    public function test_user_can_update_profile_information(): void
    {
        $role = Role::create(['name' => 'USER']);
        $user = User::factory()->create(['role_id' => $role->id, 'name' => 'Old Name', 'email' => 'old@guthrie.co.id']);

        $response = $this->actingAs($user)->put('/profile', [
            'name' => 'New Updated Name',
            'email' => 'new@guthrie.co.id',
            'position' => 'Senior Engineer',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'New Updated Name',
            'email' => 'new@guthrie.co.id',
            'position' => 'Senior Engineer',
        ]);
    }

    public function test_user_can_update_password(): void
    {
        $role = Role::create(['name' => 'USER']);
        $user = User::factory()->create([
            'role_id' => $role->id,
            'password' => Hash::make('old-password'),
        ]);

        $response = $this->actingAs($user)->put('/profile/password', [
            'current_password' => 'old-password',
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ]);

        $response->assertRedirect();
        $this->assertTrue(Hash::check('new-secure-password', $user->fresh()->password));
    }
}
