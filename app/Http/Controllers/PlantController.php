<?php

namespace App\Http\Controllers;

use App\Models\Plant;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlantController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Plant::class);

        $query = Plant::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('code', 'LIKE', "%{$search}%")
                    ->orWhere('location', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $plants = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Admin/Plants', [
            'plants' => $plants,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Plant::class);

        $validated = $request->validate([
            'code' => ['required', 'string', 'unique:plants,code'],
            'name' => ['required', 'string', 'unique:plants,name'],
            'location' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        $plant = Plant::create($validated);

        AuditService::log(
            $request->user(),
            'CREATE_PLANT',
            'MasterData',
            'Plant',
            (string) $plant->id,
            null,
            $plant->toArray(),
            "Created plant {$plant->name} ({$plant->code})"
        );

        return back()->with('success', "Plant {$plant->name} created successfully.");
    }

    public function update(Plant $plant, Request $request): RedirectResponse
    {
        $this->authorize('update', $plant);

        $validated = $request->validate([
            'code' => ['required', 'string', "unique:plants,code,{$plant->id}"],
            'name' => ['required', 'string', "unique:plants,name,{$plant->id}"],
            'location' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        $oldData = $plant->toArray();
        $plant->update($validated);

        AuditService::log(
            $request->user(),
            'UPDATE_PLANT',
            'MasterData',
            'Plant',
            (string) $plant->id,
            $oldData,
            $plant->toArray(),
            "Updated plant {$plant->name} ({$plant->code})"
        );

        return back()->with('success', "Plant {$plant->name} updated successfully.");
    }

    public function destroy(Plant $plant, Request $request): RedirectResponse
    {
        $this->authorize('delete', $plant);

        $oldData = $plant->toArray();
        $plant->delete();

        AuditService::log(
            $request->user(),
            'DELETE_PLANT',
            'MasterData',
            'Plant',
            (string) $plant->id,
            $oldData,
            null,
            "Deleted plant {$oldData['name']} ({$oldData['code']})"
        );

        return back()->with('success', "Plant {$oldData['name']} deleted successfully.");
    }
}
