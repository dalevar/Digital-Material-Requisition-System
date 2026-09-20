<?php

namespace App\Http\Controllers;

use App\Enums\MaterialRequestStatus;
use App\Models\Department;
use App\Models\MaterialRequest;
use App\Models\Plant;
use App\Models\User;
use App\Services\ApprovalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalController extends Controller
{
    public function inbox(Request $request): Response
    {
        $user = $request->user();

        // --- ADMIN MONITORING MODE ---
        // Admin sees ALL approval-relevant requests for monitoring purposes.
        // Admin CANNOT approve or reject — that is enforced by MaterialRequestPolicy.
        if ($user->isAdmin()) {
            return $this->adminMonitoring($request, $user);
        }

        // --- APPROVER INBOX MODE ---
        // Approver only sees requests relevant to their approval scope.
        return $this->approverInbox($request, $user);
    }

    /**
     * Admin approval monitoring — read-only view of all approval-relevant requests.
     * Admin is NOT permitted to approve or reject (enforced by policy on the mutation endpoints).
     */
    private function adminMonitoring(Request $request, User $user): Response
    {
        $query = MaterialRequest::with([
            'requester.department',
            'approver',
            'department',
            'plant',
            'items',
            'approvalHistories.approver',
        ]);

        // Status filter — Admin can see all statuses
        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        } else {
            // Default: show approval-relevant statuses (not DRAFT)
            if (! $request->filled('status') || $request->status === '') {
                $query->whereNotIn('status', [MaterialRequestStatus::DRAFT]);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('request_no', 'LIKE', "%{$search}%")
                    ->orWhereHas('requester', fn ($rq) => $rq->where('name', 'LIKE', "%{$search}%"))
                    ->orWhereHas('department', fn ($dq) => $dq->where('name', 'LIKE', "%{$search}%"));
            });
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('plant_id')) {
            $query->where('plant_id', $request->plant_id);
        }

        if ($request->filled('approver_id')) {
            $query->where('approver_id', $request->approver_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $requests = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        $departments = Department::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $plants = Plant::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $approvers = User::whereHas('role', fn ($r) => $r->whereIn('name', ['APPROVER', 'EXECUTIVE']))
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Approvals/Inbox', [
            'pendingRequests' => $requests,
            'isAdminMonitoring' => true,
            'departments' => $departments,
            'plants' => $plants,
            'approvers' => $approvers,
            'filters' => $request->only([
                'status',
                'search',
                'department_id',
                'plant_id',
                'approver_id',
                'date_from',
                'date_to',
            ]),
        ]);
    }

    /**
     * Approver inbox — only requests within the approver's scope.
     */
    private function approverInbox(Request $request, User $user): Response
    {
        $query = MaterialRequest::with(['requester', 'department', 'plant', 'items.material', 'approvalHistories.approver'])
            ->whereIn('status', [MaterialRequestStatus::SUBMITTED, MaterialRequestStatus::PENDING_APPROVAL])
            ->where(function ($q) use ($user) {
                $q->where('approver_id', $user->id)
                    ->orWhere('department_id', $user->department_id);
            });

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('request_no', 'LIKE', "%{$search}%")
                    ->orWhereHas('requester', fn ($rq) => $rq->where('name', 'LIKE', "%{$search}%"));
            });
        }

        $pendingRequests = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Approvals/Inbox', [
            'pendingRequests' => $pendingRequests,
            'isAdminMonitoring' => false,
            'filters' => $request->only(['search']),
        ]);
    }

    public function approve(MaterialRequest $materialRequest, Request $request, ApprovalService $service): RedirectResponse
    {
        $this->authorize('approve', $materialRequest);

        $validated = $request->validate([
            'reason' => ['nullable', 'string'],
        ]);

        $service->approve($materialRequest, $request->user(), $validated['reason'] ?? null);

        return back()->with('success', "Request {$materialRequest->request_no} has been APPROVED.");
    }

    public function reject(MaterialRequest $materialRequest, Request $request, ApprovalService $service): RedirectResponse
    {
        $this->authorize('reject', $materialRequest);

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'min:3'],
        ]);

        $service->reject($materialRequest, $request->user(), $validated['rejection_reason']);

        return back()->with('success', "Request {$materialRequest->request_no} has been REJECTED.");
    }
}
