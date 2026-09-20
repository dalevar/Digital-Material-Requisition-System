<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\MaterialCategory;
use App\Models\Plant;
use App\Models\StockBalance;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MaterialController extends Controller
{
    public function index(Request $request): Response
    {
        $materials = Material::with(['category', 'plant', 'stockBalance'])
            ->orderBy('id', 'desc')
            ->paginate(15);

        $categories = MaterialCategory::where('is_active', true)->get();
        $plants = Plant::where('is_active', true)->get();

        return Inertia::render('Admin/Materials', [
            'materials' => $materials,
            'categories' => $categories,
            'plants' => $plants,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'material_number' => ['required', 'string', 'unique:materials,material_number'],
            'description' => ['required', 'string'],
            'category_id' => ['required', 'exists:material_categories,id'],
            'uom' => ['required', 'string'],
            'minimum_stock' => ['required', 'numeric', 'gte:0'],
            'maximum_stock' => ['required', 'numeric', 'gte:0'],
            'storage_location' => ['nullable', 'string'],
            'plant_id' => ['nullable', 'exists:plants,id'],
            'status' => ['required', 'in:ACTIVE,INACTIVE'],
            'initial_stock' => ['nullable', 'numeric', 'gte:0'],
        ]);

        $initialStock = (float) ($validated['initial_stock'] ?? 0);
        unset($validated['initial_stock']);

        $mat = Material::create($validated);

        StockBalance::create([
            'material_id' => $mat->id,
            'quantity' => $initialStock,
        ]);

        AuditService::log(
            $request->user(),
            'CREATE_MATERIAL',
            'MasterData',
            'Material',
            (string) $mat->id,
            null,
            $mat->toArray(),
            "Created material {$mat->material_number}"
        );

        return back()->with('success', "Material {$mat->material_number} created successfully.");
    }

    public function update(Material $material, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'description' => ['required', 'string'],
            'category_id' => ['required', 'exists:material_categories,id'],
            'uom' => ['required', 'string'],
            'minimum_stock' => ['required', 'numeric', 'gte:0'],
            'maximum_stock' => ['required', 'numeric', 'gte:0'],
            'storage_location' => ['nullable', 'string'],
            'plant_id' => ['nullable', 'exists:plants,id'],
            'status' => ['required', 'in:ACTIVE,INACTIVE'],
        ]);

        $oldData = $material->toArray();
        $material->update($validated);

        AuditService::log(
            $request->user(),
            'UPDATE_MATERIAL',
            'MasterData',
            'Material',
            (string) $material->id,
            $oldData,
            $material->toArray(),
            "Updated material {$material->material_number}"
        );

        return back()->with('success', "Material {$material->material_number} updated successfully.");
    }
}
