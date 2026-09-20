<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Department::class);

        $query = Department::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('code', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $departments = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Admin/Departments', [
            'departments' => $departments,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Department::class);

        $validated = $request->validate([
            'code' => ['required', 'string', 'unique:departments,code'],
            'name' => ['required', 'string', 'unique:departments,name'],
            'is_active' => ['required', 'boolean'],
        ]);

        $dept = Department::create($validated);

        AuditService::log(
            $request->user(),
            'CREATE_DEPARTMENT',
            'MasterData',
            'Department',
            (string) $dept->id,
            null,
            $dept->toArray(),
            "Created department {$dept->name} ({$dept->code})"
        );

        return back()->with('success', "Department {$dept->name} created successfully.");
    }

    public function update(Department $department, Request $request): RedirectResponse
    {
        $this->authorize('update', $department);

        $validated = $request->validate([
            'code' => ['required', 'string', "unique:departments,code,{$department->id}"],
            'name' => ['required', 'string', "unique:departments,name,{$department->id}"],
            'is_active' => ['required', 'boolean'],
        ]);

        $oldData = $department->toArray();
        $department->update($validated);

        AuditService::log(
            $request->user(),
            'UPDATE_DEPARTMENT',
            'MasterData',
            'Department',
            (string) $department->id,
            $oldData,
            $department->toArray(),
            "Updated department {$department->name} ({$department->code})"
        );

        return back()->with('success', "Department {$department->name} updated successfully.");
    }
}
