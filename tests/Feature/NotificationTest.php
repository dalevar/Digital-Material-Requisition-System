<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_notifications_and_middleware_shares_unread_count(): void
    {
        $role = Role::create(['name' => 'USER']);
        $user = User::factory()->create(['role_id' => $role->id]);

        Notification::create([
            'user_id' => $user->id,
            'type' => 'PENDING_APPROVAL',
            'title' => 'Test Notification',
            'message' => 'Your request is pending',
            'is_read' => false,
        ]);

        $response = $this->actingAs($user)->get('/notifications');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Notifications/Index')
            ->where('unreadNotificationsCount', 1)
        );
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $role = Role::create(['name' => 'USER']);
        $user = User::factory()->create(['role_id' => $role->id]);

        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => 'REQUEST_APPROVED',
            'title' => 'Request Approved',
            'message' => 'Approved by HoD',
            'is_read' => false,
        ]);

        $response = $this->actingAs($user)->post("/notifications/{$notification->id}/read");

        $response->assertRedirect();
        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'is_read' => true,
        ]);
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $role = Role::create(['name' => 'USER']);
        $user = User::factory()->create(['role_id' => $role->id]);

        Notification::create(['user_id' => $user->id, 'type' => 'TEST', 'title' => 'N1', 'message' => 'M1', 'is_read' => false]);
        Notification::create(['user_id' => $user->id, 'type' => 'TEST', 'title' => 'N2', 'message' => 'M2', 'is_read' => false]);

        $response = $this->actingAs($user)->post('/notifications/read-all');

        $response->assertRedirect();
        $this->assertEquals(0, Notification::where('user_id', $user->id)->where('is_read', false)->count());
    }
}
