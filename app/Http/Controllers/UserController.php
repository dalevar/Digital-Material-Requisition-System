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
        $this->authorize('viewAny', User::class);

        $query = User::with(['role', 'department', 'plant', 'approver']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('username', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%")
                    ->orWhere('employee_id', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $users = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

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
            'filters' => $request->only(['search', 'role_id', 'department_id', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', User::class);
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
            ['id' => $user->id, 'username' => $user->username, 'name' => $user->name, 'role_id' => $user->role_id],
            "Created user {$user->username}"
        );

        return back()->with('success', "User {$user->username} created successfully.");
    }

    public function update(User $user, Request $request): RedirectResponse
    {
        $this->authorize('update', $user);

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

        $oldData = [
            'name' => $user->name,
            'email' => $user->email,
            'role_id' => $user->role_id,
            'department_id' => $user->department_id,
            'status' => $user->status,
        ];

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        $newData = [
            'name' => $user->name,
            'email' => $user->email,
            'role_id' => $user->role_id,
            'department_id' => $user->department_id,
            'status' => $user->status,
        ];

        AuditService::log(
            $request->user(),
            'UPDATE_USER',
            'UserManagement',
            'User',
            (string) $user->id,
            $oldData,
            $newData,
            "Updated user {$user->username}"
        );

        return back()->with('success', "User {$user->username} updated successfully.");
    }

    public function resetPassword(User $user, Request $request): RedirectResponse
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        AuditService::log(
            $request->user(),
            'RESET_PASSWORD_USER',
            'UserManagement',
            'User',
            (string) $user->id,
            null,
            ['user_id' => $user->id, 'action' => 'password_reset_by_admin'],
            "Reset password for user {$user->username}"
        );

        return back()->with('success', "Password for user {$user->username} has been reset successfully.");
    }

    public function destroy(User $user, Request $request): RedirectResponse
    {
        $this->authorize('delete', $user);

        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot delete your own user account.');
        }

        $oldData = [
            'id' => $user->id,
            'username' => $user->username,
            'name' => $user->name,
            'email' => $user->email,
        ];

        $user->delete();

        AuditService::log(
            $request->user(),
            'DELETE_USER',
            'UserManagement',
            'User',
            (string) $user->id,
            $oldData,
            null,
            "Deleted user {$oldData['username']}"
        );

        return back()->with('success', "User {$oldData['username']} deleted successfully.");
    }
}
