<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SessionService
{
    /**
     * Create session record for authenticated user.
     */
    public function createSession(User $user, Request $request): void
    {
        if (Schema::hasTable('user_sessions')) {
            DB::table('user_sessions')->insert([
                'user_id' => $user->id,
                'session_id' => session()->getId(),
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 500),
                'last_activity_at' => now(),
                'expires_at' => now()->addMinutes((int) config('session.lifetime', 120)),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Validate session and check expiration status.
     */
    public function validateSession(Request $request): bool
    {
        if (! Auth::check()) {
            return false;
        }

        $user = Auth::user();

        if (isset($user->status) && strtoupper((string) $user->status) === 'INACTIVE') {
            $this->revokeCurrentSession($request);

            return false;
        }

        if (Schema::hasTable('user_sessions')) {
            $sessionRecord = DB::table('user_sessions')
                ->where('session_id', session()->getId())
                ->where('user_id', $user->id)
                ->whereNull('revoked_at')
                ->first();

            if ($sessionRecord && isset($sessionRecord->expires_at) && now()->greaterThan($sessionRecord->expires_at)) {
                $this->revokeCurrentSession($request);

                return false;
            }

            if ($sessionRecord) {
                DB::table('user_sessions')
                    ->where('id', $sessionRecord->id)
                    ->update([
                        'last_activity_at' => now(),
                        'updated_at' => now(),
                    ]);
            }
        }

        return true;
    }

    /**
     * Revoke session and invalidate tokens on logout/expiration.
     */
    public function revokeCurrentSession(Request $request): void
    {
        $user = Auth::user();

        if ($user && Schema::hasTable('user_sessions')) {
            DB::table('user_sessions')
                ->where('session_id', session()->getId())
                ->update([
                    'revoked_at' => now(),
                    'updated_at' => now(),
                ]);
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
