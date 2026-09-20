<?php

namespace App\Http\Controllers;

use App\Exceptions\InsufficientStockException;
use App\Exceptions\InvalidRequestStateException;
use App\Models\Material;
use App\Models\MaterialRequest;
use App\Models\StockTransaction;
use App\Models\User;
use App\Services\InventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

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

    private function getStockHistoryQuery(Request $request)
    {
        $query = StockTransaction::with(['material.category', 'user']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_no', 'LIKE', "%{$search}%")
                    ->orWhere('note', 'LIKE', "%{$search}%")
                    ->orWhere('supplier', 'LIKE', "%{$search}%")
                    ->orWhereHas('material', function ($mq) use ($search) {
                        $mq->where('material_number', 'LIKE', "%{$search}%")
                            ->orWhere('description', 'LIKE', "%{$search}%");
                    })
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'LIKE', "%{$search}%")
                            ->orWhere('username', 'LIKE', "%{$search}%");
                    });
            });
        }

        if ($request->filled('material_id')) {
            $query->where('material_id', $request->material_id);
        }

        if ($request->filled('transaction_type')) {
            $query->where('transaction_type', $request->transaction_type);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('transaction_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('transaction_date', '<=', $request->date_to);
        }

        return $query->orderBy('id', 'desc');
    }

    public function history(Request $request): Response
    {
        $query = $this->getStockHistoryQuery($request);
        $transactions = $query->paginate(20)->withQueryString();

        $materials = Material::select('id', 'material_number', 'description')->orderBy('material_number')->get();
        $users = User::select('id', 'name', 'username')->orderBy('name')->get();

        return Inertia::render('Inventory/StockHistory', [
            'transactions' => $transactions,
            'materials' => $materials,
            'users' => $users,
            'filters' => $request->only(['search', 'material_id', 'transaction_type', 'user_id', 'date_from', 'date_to']),
        ]);
    }

    public function exportHistoryExcel(Request $request)
    {
        $transactions = $this->getStockHistoryQuery($request)->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Stock History');

        $headers = [
            'Date & Time',
            'Material Number',
            'Description',
            'UoM',
            'Transaction Type',
            'Reference No',
            'Qty In',
            'Qty Out',
            'Balance After',
            'Executed By',
            'Supplier',
            'Storage Location',
            'Note',
        ];
        $sheet->fromArray($headers, null, 'A1');

        $row = 2;
        foreach ($transactions as $tx) {
            $sheet->fromArray([
                $tx->transaction_date ? date('Y-m-d H:i:s', strtotime($tx->transaction_date)) : '-',
                $tx->material?->material_number ?? '-',
                $tx->material?->description ?? '-',
                $tx->material?->uom ?? '-',
                is_object($tx->transaction_type) ? $tx->transaction_type->value : (string) $tx->transaction_type,
                $tx->reference_no ?? '-',
                (float) $tx->qty_in,
                (float) $tx->qty_out,
                (float) $tx->balance_after,
                $tx->user?->name ?? 'System',
                $tx->supplier ?? '-',
                $tx->storage_location ?? '-',
                $tx->note ?? '-',
            ], null, "A{$row}");
            $row++;
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'dmrs-stock-history-'.date('Y-m-d-H-i').'.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function stockIn(Request $request, InventoryService $service): RedirectResponse
    {
        $this->authorize('stockIn', StockTransaction::class);

        $validated = $request->validate([
            'material_id' => ['required', 'exists:materials,id'],
            'qty' => ['required', 'numeric', 'gt:0'],
            'reference_no' => ['required', 'string', 'max:100'],
            'supplier' => ['nullable', 'string', 'max:100'],
            'storage_location' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $service->stockIn(
                (int) $validated['material_id'],
                (float) $validated['qty'],
                $validated['reference_no'],
                $request->user(),
                $validated['supplier'] ?? null,
                $validated['storage_location'] ?? null,
                $validated['note'] ?? null
            );

            return back()->with('success', 'Stock In recorded successfully.');
        } catch (\Throwable $e) {
            Log::error('Stock In failed: '.$e->getMessage());

            return back()->withErrors(['error' => 'Failed to record Stock In: '.$e->getMessage()]);
        }
    }

    public function stockAdjustment(Request $request, InventoryService $service): RedirectResponse
    {
        $this->authorize('stockAdjustment', StockTransaction::class);

        $validated = $request->validate([
            'material_id' => ['required', 'exists:materials,id'],
            'target_qty' => ['required', 'numeric', 'gte:0'],
            'reason' => ['required', 'string', 'min:3', 'max:500'],
        ]);

        try {
            $service->stockAdjustment(
                (int) $validated['material_id'],
                (float) $validated['target_qty'],
                $validated['reason'],
                $request->user()
            );

            return back()->with('success', 'Stock Adjustment recorded successfully.');
        } catch (\Throwable $e) {
            Log::error('Stock Adjustment failed: '.$e->getMessage());

            return back()->withErrors(['error' => 'Failed to record Stock Adjustment: '.$e->getMessage()]);
        }
    }

    public function issueStockForRequest(MaterialRequest $materialRequest, Request $request, InventoryService $service): RedirectResponse
    {
        $this->authorize('issueStock', StockTransaction::class);

        try {
            $service->issueRequestStock($materialRequest, $request->user());

            return back()->with('success', "Stock issued successfully for request {$materialRequest->request_no}. Status updated to COMPLETED.");
        } catch (InsufficientStockException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        } catch (InvalidRequestStateException $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        } catch (\Throwable $e) {
            Log::error("Stock Out failed for request {$materialRequest->id}: ".$e->getMessage());

            return back()->withErrors(['error' => 'Unable to process Stock Out. Please check inventory stock availability and try again.']);
        }
    }
}
