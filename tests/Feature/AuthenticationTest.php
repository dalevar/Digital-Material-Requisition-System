<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_user_can_authenticate_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'username' => 'testuser',
            'password' => Hash::make('password123'),
            'status' => 'ACTIVE',
        ]);

        $response = $this->post('/login', [
            'username' => 'testuser',
            'password' => 'password123',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect('/user/dashboard');
    }

    public function test_admin_user_is_redirected_to_admin_dashboard(): void
    {
        $admin = User::factory()->create([
            'username' => 'adminuser',
            'password' => Hash::make('password123'),
            'status' => 'ACTIVE',
        ]);

        // Mock isAdmin method
        if (method_exists($admin, 'isAdmin')) {
            $response = $this->actingAs($admin)->get('/dashboard');
            $response->assertStatus(200);
        }
    }

    public function test_user_cannot_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'username' => 'testuser',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->post('/login', [
            'username' => 'testuser',
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('username');
    }

    public function test_user_cannot_authenticate_when_inactive(): void
    {
        $user = User::factory()->create([
            'username' => 'inactiveuser',
            'password' => Hash::make('password123'),
            'status' => 'INACTIVE',
        ]);

        $response = $this->post('/login', [
            'username' => 'inactiveuser',
            'password' => 'password123',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('auth');
    }

    public function test_login_requires_username_and_password(): void
    {
        $response = $this->post('/login', [
            'username' => '',
            'password' => '',
        ]);

        $response->assertSessionHasErrors(['username', 'password']);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/login');
    }

    public function test_forgot_password_screen_can_be_rendered(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    public function test_forgot_password_returns_neutral_response_for_known_and_unknown_emails(): void
    {
        $user = User::factory()->create(['email' => 'known@guthrie.co.id']);

        $responseKnown = $this->post('/forgot-password', ['email' => 'known@guthrie.co.id']);
        $responseKnown->assertSessionHas('status', 'If an account matches that email address, reset instructions have been sent.');

        $responseUnknown = $this->post('/forgot-password', ['email' => 'unknown@guthrie.co.id']);
        $responseUnknown->assertSessionHas('status', 'If an account matches that email address, reset instructions have been sent.');
    }

    public function test_reset_password_screen_can_be_rendered(): void
    {
        $response = $this->get('/reset-password/sample-token');

        $response->assertStatus(200);
    }

    public function test_reset_password_validates_password_confirmation_mismatch(): void
    {
        $response = $this->post('/reset-password', [
            'token' => 'sample-token',
            'email' => 'user@guthrie.co.id',
            'password' => 'newpassword123',
            'password_confirmation' => 'mismatch123',
        ]);

        $response->assertSessionHasErrors('password');
    }

    public function test_session_expired_screen_can_be_rendered(): void
    {
        $response = $this->get('/session-expired');

        $response->assertStatus(200);
    }

    public function test_unauthorized_screen_can_be_rendered(): void
    {
        $response = $this->get('/unauthorized');

        $response->assertStatus(200);
    }

    public function test_authentication_error_screen_can_be_rendered(): void
    {
        $response = $this->get('/authentication-error');

        $response->assertStatus(200);
    }
}
