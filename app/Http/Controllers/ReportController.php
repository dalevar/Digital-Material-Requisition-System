<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\MaterialRequest;
use App\Models\StockTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ReportController extends Controller
{
    private function getStockMovementQuery(Request $request)
    {
        $query = StockTransaction::with(['material.category', 'user']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_no', 'LIKE', "%{$search}%")
                    ->orWhere('note', 'LIKE', "%{$search}%")
                    ->orWhere('reason', 'LIKE', "%{$search}%")
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

    public function stockMovementReport(Request $request): Response
    {
        $query = $this->getStockMovementQuery($request);
        $movements = $query->paginate(20)->withQueryString();

        $materials = Material::select('id', 'material_number', 'description')->orderBy('material_number')->get();
        $users = User::select('id', 'name', 'username')->orderBy('name')->get();

        return Inertia::render('Reports/StockMovementReport', [
            'movements' => $movements,
            'materials' => $materials,
            'users' => $users,
            'filters' => $request->only(['search', 'material_id', 'transaction_type', 'user_id', 'date_from', 'date_to']),
        ]);
    }

    public function exportStockMovementExcel(Request $request)
    {
        $movements = $this->getStockMovementQuery($request)->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Stock Movement');

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
            'Reason / Note',
        ];
        $sheet->fromArray($headers, null, 'A1');

        $row = 2;
        foreach ($movements as $tx) {
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
                $tx->note ?? $tx->reason ?? '-',
            ], null, "A{$row}");
            $row++;
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'dmrs-stock-movement-'.date('Y-m-d-H-i').'.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function requestReport(Request $request): Response
    {
        $query = MaterialRequest::with(['requester', 'department', 'plant', 'approver', 'items.material']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('request_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('request_date', '<=', $request->date_to);
        }

        $requests = $query->orderBy('id', 'desc')->paginate(20)->withQueryString();

        return Inertia::render('Reports/RequestReport', [
            'requests' => $requests,
            'filters' => $request->only(['status', 'date_from', 'date_to']),
        ]);
    }

    public function stockReport(Request $request): Response
    {
        $materials = Material::with(['category', 'plant', 'stockBalance'])
            ->get()
            ->map(function ($mat) {
                $stockIn = StockTransaction::where('material_id', $mat->id)->sum('qty_in');
                $stockOut = StockTransaction::where('material_id', $mat->id)->sum('qty_out');
                $closing = $mat->soh;

                return [
                    'id' => $mat->id,
                    'material_number' => $mat->material_number,
                    'description' => $mat->description,
                    'uom' => $mat->uom,
                    'minimum_stock' => $mat->minimum_stock,
                    'maximum_stock' => $mat->maximum_stock,
                    'stock_in' => $stockIn,
                    'stock_out' => $stockOut,
                    'closing_stock' => $closing,
                    'status' => $mat->stock_status,
                ];
            });

        return Inertia::render('Reports/StockReport', [
            'reports' => $materials,
        ]);
    }

    public function exportRequestExcel(Request $request)
    {
        $query = MaterialRequest::with(['requester', 'department', 'plant', 'approver', 'items.material']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('request_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('request_date', '<=', $request->date_to);
        }

        $requests = $query->orderBy('id', 'desc')->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Material Requests');

        $headers = ['Request No', 'Doc No', 'Date', 'Requester', 'Department', 'Plant', 'GL Account', 'Cost Center', 'Status', 'Approver', 'Approved Date'];
        $sheet->fromArray($headers, null, 'A1');

        $row = 2;
        foreach ($requests as $mr) {
            $sheet->fromArray([
                $mr->request_no,
                $mr->no_doc ?? '-',
                $mr->request_date?->format('Y-m-d'),
                $mr->requester?->name,
                $mr->department?->name ?? '-',
                $mr->plant?->name ?? '-',
                $mr->gl_account ?? '-',
                $mr->cost_center ?? '-',
                is_object($mr->status) ? $mr->status->value : (string) $mr->status,
                $mr->approver?->name ?? '-',
                $mr->approved_at?->format('Y-m-d H:i') ?? '-',
            ], null, "A{$row}");
            $row++;
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'DMRS_Material_Requests_'.date('Ymd_His').'.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function approvalReport(Request $request): Response
    {
        $query = MaterialRequest::with(['requester', 'department', 'plant', 'approver', 'approvalHistories.approver']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('request_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('request_date', '<=', $request->date_to);
        }

        $statsQuery = clone $query;
        $allMatching = $statsQuery->get();

        $stats = [
            'totalCount' => $allMatching->count(),
            'approvedCount' => $allMatching->filter(fn ($r) => in_array($r->status?->value ?? $r->status, ['APPROVED', 'PROCESSING', 'COMPLETED']))->count(),
            'rejectedCount' => $allMatching->filter(fn ($r) => ($r->status?->value ?? $r->status) === 'REJECTED')->count(),
            'pendingCount' => $allMatching->filter(fn ($r) => in_array($r->status?->value ?? $r->status, ['SUBMITTED', 'PENDING_APPROVAL']))->count(),
        ];

        $requests = $query->orderBy('id', 'desc')->paginate(20)->withQueryString();

        return Inertia::render('Reports/ApprovalReport', [
            'requests' => $requests,
            'filters' => $request->only(['status', 'date_from', 'date_to']),
            'stats' => $stats,
        ]);
    }

    public function exportApprovalExcel(Request $request)
    {
        $query = MaterialRequest::with(['requester', 'department', 'plant', 'approver', 'approvalHistories.approver']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('request_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('request_date', '<=', $request->date_to);
        }

        $requests = $query->orderBy('id', 'desc')->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Approval Report');

        $headers = ['Request No', 'Doc No', 'Date', 'Requester', 'Department', 'Plant', 'Approver', 'Status', 'Approved / Action Date', 'Rejection / Action Reason'];
        $sheet->fromArray($headers, null, 'A1');

        $row = 2;
        foreach ($requests as $mr) {
            $latestHistory = $mr->approvalHistories->last();
            $actionDate = $mr->approved_at?->format('Y-m-d H:i')
                ?? $mr->rejected_at?->format('Y-m-d H:i')
                ?? $latestHistory?->action_at?->format('Y-m-d H:i')
                ?? '-';

            $reason = $mr->rejection_reason
                ?? $latestHistory?->reason
                ?? '-';

            $sheet->fromArray([
                $mr->request_no,
                $mr->no_doc ?? '-',
                $mr->request_date?->format('Y-m-d'),
                $mr->requester?->name ?? '-',
                $mr->department?->name ?? '-',
                $mr->plant?->name ?? '-',
                $mr->approver?->name ?? '-',
                is_object($mr->status) ? $mr->status->value : (string) $mr->status,
                $actionDate,
                $reason,
            ], null, "A{$row}");
            $row++;
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'DMRS_Approval_Report_'.date('Ymd_His').'.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
