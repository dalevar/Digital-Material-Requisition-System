<?php

namespace App\Http\Controllers;

use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Services\AuthenticationService;
use App\Services\PasswordResetService;
use App\Services\SessionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        protected AuthenticationService $authService,
        protected PasswordResetService $passwordResetService,
        protected SessionService $sessionService
    ) {}

    public function showLogin()
    {
        return inertia('Auth/Login');
    }

    public function login(LoginRequest $request): RedirectResponse
    {
        $result = $this->authService->authenticate(
            $request->validated('username'),
            $request->validated('password'),
            $request->boolean('remember'),
            $request
        );

        if (! $result['success']) {
            if ($result['error_type'] === 'inactive_account') {
                return back()->withErrors(['auth' => $result['error_message']]);
            }

            return back()->withErrors(['username' => $result['error_message']])->onlyInput('username');
        }

        return redirect()->intended($result['redirect']);
    }

    public function logout(Request $request): RedirectResponse
    {
        $this->sessionService->revokeCurrentSession($request);

        return redirect('/login');
    }

    public function showForgotPassword()
    {
        return inertia('Auth/ForgotPassword');
    }

    public function sendResetLink(ForgotPasswordRequest $request): RedirectResponse
    {
        $message = $this->passwordResetService->sendResetLink($request->validated('email'));

        return back()->with('status', $message);
    }

    public function showResetPassword(Request $request)
    {
        return inertia('Auth/ResetPassword', [
            'token' => $request->route('token') ?? '',
            'email' => $request->query('email') ?? '',
            'isExpired' => $request->boolean('expired', false),
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): RedirectResponse
    {
        $success = $this->passwordResetService->resetPassword(
            $request->validated('email'),
            $request->validated('password'),
            $request->validated('token')
        );

        if (! $success) {
            return back()->withErrors(['password' => 'This password reset request is invalid or has expired.']);
        }

        return redirect('/reset-password/success');
    }

    public function showResetSuccess()
    {
        return inertia('Auth/ResetSuccess');
    }

    public function showSessionExpired()
    {
        return inertia('Auth/SessionExpired');
    }

    public function showUnauthorized()
    {
        return inertia('Auth/Unauthorized');
    }

    public function showAuthenticationError()
    {
        return inertia('Auth/AuthenticationError');
    }
}
