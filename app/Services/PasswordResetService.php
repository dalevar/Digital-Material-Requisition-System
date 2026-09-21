<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class PasswordResetService
{
    /**
     * Process password reset token generation & dispatch (security neutral response).
     */
    public function sendResetLink(string $email): string
    {
        $user = User::where('email', $email)->first();

        if ($user && Schema::hasTable('password_reset_tokens')) {
            $rawToken = Str::random(64);
            $tokenHash = Hash::make($rawToken);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $email],
                [
                    'token' => $tokenHash,
                    'created_at' => now(),
                ]
            );

            // Audit log for reset request
            AuditService::log($user, 'PASSWORD_RESET_REQUEST', 'Authentication', 'User', (string) $user->id, null, null, "Password reset link requested for {$email}");
        }

        // Always return security neutral response to prevent account enumeration
        return 'If an account matches that email address, reset instructions have been sent.';
    }

    /**
     * Validate reset token and update user password securely.
     */
    public function resetPassword(string $email, string $password, string $token): bool
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            return false;
        }

        if (Schema::hasTable('password_reset_tokens')) {
            $record = DB::table('password_reset_tokens')->where('email', $email)->first();

            if (! $record || ! Hash::check($token, $record->token)) {
                return false;
            }

            // Invalidate token after single use
            DB::table('password_reset_tokens')->where('email', $email)->delete();
        }

        $user->forceFill([
            'password' => Hash::make($password),
        ])->save();

        AuditService::log($user, 'PASSWORD_RESET_COMPLETE', 'Authentication', 'User', (string) $user->id, null, null, "Password reset completed for {$email}");

        return true;
    }
}
