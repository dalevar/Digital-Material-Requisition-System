<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticationService
{
    public function __construct(
        protected SessionService $sessionService
    ) {}

    /**
     * Authenticate user credentials and return authentication result status.
     *
     * @return array{success: bool, redirect?: string, error_type?: string, error_message?: string}
     */
    public function authenticate(string $username, string $password, bool $remember, Request $request): array
    {
        if (! Auth::attempt(['username' => $username, 'password' => $password], $remember)) {
            return [
                'success' => false,
                'error_type' => 'invalid_credentials',
                'error_message' => 'Invalid username or password. Please check your credentials and try again.',
            ];
        }

        $user = Auth::user();

        // Check for inactive user account
        if (isset($user->status) && strtoupper((string) $user->status) === 'INACTIVE') {
            $this->sessionService->revokeCurrentSession($request);

            return [
                'success' => false,
                'error_type' => 'inactive_account',
                'error_message' => 'This account is currently unavailable. Please contact your administrator.',
            ];
        }

        // Regenerate session and store session metadata
        $request->session()->regenerate();
        $user->update(['last_login_at' => now()]);
        $this->sessionService->createSession($user, $request);

        // Audit log login event
        AuditService::log($user, 'LOGIN', 'Authentication', 'User', (string) $user->id, null, null, "User {$user->username} logged in successfully");

        // Centralized Role Resolution
        $redirectUrl = $this->resolveDashboardUrl($user);

        return [
            'success' => true,
            'redirect' => $redirectUrl,
        ];
    }

    /**
     * Centralized role resolution mechanism to determine role-based dashboard destination.
     */
    public function resolveDashboardUrl(User $user): string
    {
        if ($user->isAdmin()) {
            return '/admin/dashboard';
        }

        if ($user->isApprover()) {
            return '/approver/dashboard';
        }

        return '/user/dashboard';
    }
}
