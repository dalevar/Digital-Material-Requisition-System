<?php

namespace App\Http\Controllers;

use App\Enums\MaterialRequestStatus;
use App\Models\Material;
use App\Models\MaterialRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function userDashboard(Request $request): Response
    {
        $user = $request->user();

        $stats = [
            'myRequests' => MaterialRequest::where('requester_id', $user->id)->count(),
            'pending' => MaterialRequest::where('requester_id', $user->id)->whereIn('status', [MaterialRequestStatus::SUBMITTED, MaterialRequestStatus::PENDING_APPROVAL])->count(),
            'approved' => MaterialRequest::where('requester_id', $user->id)->where('status', MaterialRequestStatus::APPROVED)->count(),
            'rejected' => MaterialRequest::where('requester_id', $user->id)->where('status', MaterialRequestStatus::REJECTED)->count(),
            'completed' => MaterialRequest::where('requester_id', $user->id)->where('status', MaterialRequestStatus::COMPLETED)->count(),
        ];

        $recentRequests = MaterialRequest::where('requester_id', $user->id)
            ->with(['department', 'plant', 'items.material'])
            ->orderBy('id', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard/UserDashboard', [
            'stats' => $stats,
            'recentRequests' => $recentRequests,
        ]);
    }

    public function approverDashboard(Request $request): Response
    {
        $user = $request->user();

        $query = MaterialRequest::where(function ($q) use ($user) {
            $q->where('approver_id', $user->id)
                ->orWhere('department_id', $user->department_id);
        });

        $stats = [
            'pendingApproval' => (clone $query)->whereIn('status', [MaterialRequestStatus::SUBMITTED, MaterialRequestStatus::PENDING_APPROVAL])->count(),
            'approved' => (clone $query)->where('status', MaterialRequestStatus::APPROVED)->count(),
            'rejected' => (clone $query)->where('status', MaterialRequestStatus::REJECTED)->count(),
        ];

        $pendingRequests = (clone $query)->whereIn('status', [MaterialRequestStatus::SUBMITTED, MaterialRequestStatus::PENDING_APPROVAL])
            ->with(['requester', 'department', 'plant', 'items.material'])
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('Dashboard/ApproverDashboard', [
            'stats' => $stats,
            'pendingRequests' => $pendingRequests,
        ]);
    }

    public function adminDashboard(Request $request): Response
    {
        $materials = Material::with('stockBalance')->get();

        $lowStockCount = 0;
        $outOfStockCount = 0;
        $totalStockQty = 0;

        foreach ($materials as $mat) {
            $soh = $mat->soh;
            $totalStockQty += $soh;
            if ($soh <= 0) {
                $outOfStockCount++;
            } elseif ($soh <= $mat->minimum_stock) {
                $lowStockCount++;
            }
        }

        $stats = [
            'totalMaterials' => $materials->count(),
            'totalStockQty' => $totalStockQty,
            'lowStock' => $lowStockCount,
            'outOfStock' => $outOfStockCount,
            'pendingRequests' => MaterialRequest::whereIn('status', [MaterialRequestStatus::SUBMITTED, MaterialRequestStatus::PENDING_APPROVAL])->count(),
            'approvedRequests' => MaterialRequest::where('status', MaterialRequestStatus::APPROVED)->count(),
            'rejectedRequests' => MaterialRequest::where('status', MaterialRequestStatus::REJECTED)->count(),
            'completedRequests' => MaterialRequest::where('status', MaterialRequestStatus::COMPLETED)->count(),
        ];

        $recentActivity = MaterialRequest::with(['requester', 'department', 'plant'])
            ->orderBy('id', 'desc')
            ->take(8)
            ->get();

        return Inertia::render('Dashboard/AdminDashboard', [
            'stats' => $stats,
            'recentActivity' => $recentActivity,
        ]);
    }
}
