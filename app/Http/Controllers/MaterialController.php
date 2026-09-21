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
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class MaterialController extends Controller
{
    private function getMaterialsQuery(Request $request)
    {
        $query = Material::with(['category', 'plant', 'stockBalance']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('material_number', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('plant_id')) {
            $query->where('plant_id', $request->plant_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $query->orderBy('id', 'desc');
    }

    public function index(Request $request): Response
    {
        $query = $this->getMaterialsQuery($request);

        $materials = $query->paginate(15)->withQueryString();
        $categories = MaterialCategory::where('is_active', true)->get();
        $plants = Plant::where('is_active', true)->get();

        return Inertia::render('Admin/Materials', [
            'materials' => $materials,
            'categories' => $categories,
            'plants' => $plants,
            'filters' => $request->only(['search', 'category_id', 'plant_id', 'status']),
        ]);
    }

    public function exportExcel(Request $request)
    {
        $materials = $this->getMaterialsQuery($request)->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Master Materials');

        $headers = [
            'Material Number',
            'Description',
            'Category',
            'UoM',
            'Min Stock',
            'Max Stock',
            'Current SOH',
            'Storage Location',
            'Plant',
            'Status',
        ];
        $sheet->fromArray($headers, null, 'A1');

        $row = 2;
        foreach ($materials as $m) {
            $sheet->fromArray([
                $m->material_number,
                $m->description,
                $m->category?->name ?? '-',
                $m->uom,
                (float) $m->minimum_stock,
                (float) $m->maximum_stock,
                (float) ($m->stockBalance?->quantity ?? 0),
                $m->storage_location ?? '-',
                $m->plant?->name ?? '-',
                $m->status,
            ], null, "A{$row}");
            $row++;
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'dmrs-master-materials-'.date('Y-m-d-H-i').'.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Material::class);

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
        $this->authorize('update', $material);

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
