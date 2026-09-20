<?php

namespace App\Http\Controllers;

use App\Enums\MaterialRequestStatus;
use App\Models\Material;
use App\Models\MaterialRequest;
use App\Models\StockTransaction;
use App\Services\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function overview(Request $request): Response
    {
        $materials = Material::with(['category', 'plant', 'stockBalance'])
            ->orderBy('id', 'desc')
            ->paginate(15);

        return Inertia::render('Inventory/StockOverview', [
            'materials' => $materials,
        ]);
    }

    public function history(Request $request): Response
    {
        $query = StockTransaction::with(['material', 'user']);

        if ($request->filled('material_id')) {
            $query->where('material_id', $request->material_id);
        }

        if ($request->filled('transaction_type')) {
            $query->where('transaction_type', $request->transaction_type);
        }

        $transactions = $query->orderBy('id', 'desc')->paginate(20)->withQueryString();
        $materials = Material::select('id', 'material_number', 'description')->get();

        return Inertia::render('Inventory/StockHistory', [
            'transactions' => $transactions,
            'materials' => $materials,
            'filters' => $request->only(['material_id', 'transaction_type']),
        ]);
    }

    public function stockIn(Request $request, InventoryService $service): RedirectResponse
    {
        $validated = $request->validate([
            'material_id' => ['required', 'exists:materials,id'],
            'qty' => ['required', 'numeric', 'gt:0'],
            'reference_no' => ['required', 'string'],
            'supplier' => ['nullable', 'string'],
            'storage_location' => ['nullable', 'string'],
            'note' => ['nullable', 'string'],
        ]);

        $service->stockIn(
            $validated['material_id'],
            (float) $validated['qty'],
            $validated['reference_no'],
            $request->user(),
            $validated['supplier'] ?? null,
            $validated['storage_location'] ?? null,
            $validated['note'] ?? null
        );

        return back()->with('success', 'Stock In recorded successfully.');
    }

    public function stockAdjustment(Request $request, InventoryService $service): RedirectResponse
    {
        $validated = $request->validate([
            'material_id' => ['required', 'exists:materials,id'],
            'target_qty' => ['required', 'numeric', 'gte:0'],
            'reason' => ['required', 'string', 'min:3'],
        ]);

        $service->stockAdjustment(
            $validated['material_id'],
            (float) $validated['target_qty'],
            $validated['reason'],
            $request->user()
        );

        return back()->with('success', 'Stock Adjustment recorded successfully.');
    }

    public function issueStockForRequest(MaterialRequest $materialRequest, Request $request, InventoryService $service): RedirectResponse
    {
        if ($materialRequest->status !== MaterialRequestStatus::APPROVED && $materialRequest->status !== MaterialRequestStatus::PROCESSING) {
            return back()->withErrors(['error' => 'Stock can only be issued for APPROVED or PROCESSING requests.']);
        }

        foreach ($materialRequest->items as $item) {
            $service->stockOut(
                $item->material_id,
                (float) $item->qty,
                $materialRequest->request_no,
                $request->user(),
                'MATERIAL_REQUEST',
                (string) $materialRequest->id,
                "Stock issued for request {$materialRequest->request_no}"
            );
        }

        $materialRequest->update(['status' => MaterialRequestStatus::COMPLETED]);

        return back()->with('success', 'Stock issued and request marked as COMPLETED.');
    }
}
