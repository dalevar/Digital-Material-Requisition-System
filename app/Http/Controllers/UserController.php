<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Plant;
use App\Models\Role;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::with(['role', 'department', 'plant', 'approver'])
            ->orderBy('id', 'desc')
            ->paginate(15);

        $roles = Role::where('is_active', true)->get();
        $departments = Department::where('is_active', true)->get();
        $plants = Plant::where('is_active', true)->get();
        $approvers = User::whereHas('role', fn ($r) => $r->whereIn('name', ['APPROVER', 'EXECUTIVE']))->get();

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'roles' => $roles,
            'departments' => $departments,
            'plants' => $plants,
            'approvers' => $approvers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'string', 'unique:users,employee_id'],
            'username' => ['required', 'string', 'unique:users,username'],
            'name' => ['required', 'string'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role_id' => ['required', 'exists:roles,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'plant_id' => ['nullable', 'exists:plants,id'],
            'approver_id' => ['nullable', 'exists:users,id'],
            'position' => ['nullable', 'string'],
            'status' => ['required', 'in:ACTIVE,INACTIVE'],
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        AuditService::log(
            $request->user(),
            'CREATE_USER',
            'UserManagement',
            'User',
            (string) $user->id,
            null,
            $user->toArray(),
            "Created user {$user->username}"
        );

        return back()->with('success', "User {$user->username} created successfully.");
    }

    public function update(User $user, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'email' => ['required', 'email', "unique:users,email,{$user->id}"],
            'password' => ['nullable', 'string', 'min:6'],
            'role_id' => ['required', 'exists:roles,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'plant_id' => ['nullable', 'exists:plants,id'],
            'approver_id' => ['nullable', 'exists:users,id'],
            'position' => ['nullable', 'string'],
            'status' => ['required', 'in:ACTIVE,INACTIVE'],
        ]);

        $oldData = $user->toArray();

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        AuditService::log(
            $request->user(),
            'UPDATE_USER',
            'UserManagement',
            'User',
            (string) $user->id,
            $oldData,
            $user->toArray(),
            "Updated user {$user->username}"
        );

        return back()->with('success', "User {$user->username} updated successfully.");
    }
}
