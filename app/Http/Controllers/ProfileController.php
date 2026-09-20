<?php

namespace App\Http\Controllers;

use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user()->load(['department', 'plant', 'role', 'approver']);

        return Inertia::render('Profile/Show', [
            'userProfile' => $user,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', "unique:users,email,{$user->id}"],
            'position' => ['nullable', 'string', 'max:255'],
        ]);

        $oldData = $user->toArray();
        $user->update($validated);

        AuditService::log(
            $user,
            'UPDATE_PROFILE',
            'UserManagement',
            'User',
            (string) $user->id,
            $oldData,
            $user->toArray(),
            "User {$user->username} updated profile details"
        );

        return back()->with('success', 'Profile details updated successfully.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string', 'current_password'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        AuditService::log(
            $user,
            'UPDATE_PASSWORD',
            'UserManagement',
            'User',
            (string) $user->id,
            null,
            null,
            "User {$user->username} changed password"
        );

        return back()->with('success', 'Password updated successfully.');
    }
}
