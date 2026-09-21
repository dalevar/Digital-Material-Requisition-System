<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public static function notify(
        User $user,
        string $type,
        string $title,
        string $message,
        ?array $metadata = null
    ): Notification {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'is_read' => false,
            'metadata' => $metadata,
        ]);
    }
}
