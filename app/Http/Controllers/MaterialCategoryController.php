<?php

namespace App\Http\Controllers;

use App\Models\MaterialCategory;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MaterialCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', MaterialCategory::class);

        $query = MaterialCategory::query();

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

        $categories = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Admin/Categories', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', MaterialCategory::class);

        $validated = $request->validate([
            'code' => ['required', 'string', 'unique:material_categories,code'],
            'name' => ['required', 'string', 'unique:material_categories,name'],
            'is_active' => ['required', 'boolean'],
        ]);

        $category = MaterialCategory::create($validated);

        AuditService::log(
            $request->user(),
            'CREATE_CATEGORY',
            'MasterData',
            'MaterialCategory',
            (string) $category->id,
            null,
            $category->toArray(),
            "Created material category {$category->name} ({$category->code})"
        );

        return back()->with('success', "Material Category {$category->name} created successfully.");
    }

    public function update(MaterialCategory $category, Request $request): RedirectResponse
    {
        $this->authorize('update', $category);

        $validated = $request->validate([
            'code' => ['required', 'string', "unique:material_categories,code,{$category->id}"],
            'name' => ['required', 'string', "unique:material_categories,name,{$category->id}"],
            'is_active' => ['required', 'boolean'],
        ]);

        $oldData = $category->toArray();
        $category->update($validated);

        AuditService::log(
            $request->user(),
            'UPDATE_CATEGORY',
            'MasterData',
            'MaterialCategory',
            (string) $category->id,
            $oldData,
            $category->toArray(),
            "Updated material category {$category->name} ({$category->code})"
        );

        return back()->with('success', "Material Category {$category->name} updated successfully.");
    }
}
