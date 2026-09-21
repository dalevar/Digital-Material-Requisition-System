<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AuditLogController extends Controller
{
    private function getAuditQuery(Request $request): Builder
    {
        $query = AuditLog::with('user');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('module', 'LIKE', "%{$search}%")
                    ->orWhere('action', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'LIKE', "%{$search}%")
                            ->orWhere('username', 'LIKE', "%{$search}%");
                    });
            });
        }

        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        return $query->orderBy('id', 'desc');
    }

    public function index(Request $request): Response
    {
        $logs = $this->getAuditQuery($request)->paginate(20)->withQueryString();

        return Inertia::render('Admin/AuditTrail', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'module', 'action', 'date_from', 'date_to']),
        ]);
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        $logs = $this->getAuditQuery($request)->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Audit Trail');

        $headers = [
            'ID',
            'Timestamp',
            'User Name',
            'User Role',
            'Action',
            'Module',
            'Description',
            'Old Values',
            'New Values',
            'IP Address',
            'User Agent',
        ];
        $sheet->fromArray($headers, null, 'A1');

        $row = 2;
        foreach ($logs as $log) {
            $sheet->fromArray([
                $log->id,
                $log->created_at ? $log->created_at->format('Y-m-d H:i:s') : '-',
                $log->user?->name ?? 'System',
                $log->role ?? '-',
                $log->action,
                $log->module,
                $log->description,
                $log->old_value ? json_encode($log->old_value, JSON_UNESCAPED_SLASHES) : '-',
                $log->new_value ? json_encode($log->new_value, JSON_UNESCAPED_SLASHES) : '-',
                $log->ip_address ?? '-',
                $log->user_agent ?? '-',
            ], null, "A{$row}");
            $row++;
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'DMRS_Audit_Trail_'.date('Ymd_His').'.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
