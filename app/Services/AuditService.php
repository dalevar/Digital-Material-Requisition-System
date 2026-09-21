<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Request;

class AuditService
{
    public static function log(
        ?User $user,
        string $action,
        string $module,
        ?string $recordType = null,
        ?string $recordId = null,
        ?array $oldValue = null,
        ?array $newValue = null,
        ?string $description = null
    ): AuditLog {
        return AuditLog::create([
            'user_id' => $user?->id,
            'role' => $user?->role?->name,
            'action' => $action,
            'module' => $module,
            'record_type' => $recordType,
            'record_id' => (string) $recordId,
            'old_value' => $oldValue,
            'new_value' => $newValue,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'description' => $description,
        ]);
    }
}
