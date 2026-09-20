<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AuditLog::with('user');

        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        $logs = $query->orderBy('id', 'desc')->paginate(20)->withQueryString();

        return Inertia::render('Admin/AuditTrail', [
            'logs' => $logs,
            'filters' => $request->only(['module', 'action']),
        ]);
    }
}
