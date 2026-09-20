<?php

namespace App\Http\Controllers;

use App\Enums\MaterialRequestStatus;
use App\Models\MaterialRequest;
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

        $query = MaterialRequest::with(['requester', 'department', 'plant', 'items.material'])
            ->whereIn('status', [MaterialRequestStatus::SUBMITTED, MaterialRequestStatus::PENDING_APPROVAL])
            ->where(function ($q) use ($user) {
                $q->where('approver_id', $user->id)
                    ->orWhere('department_id', $user->department_id);
            });

        $pendingRequests = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Approvals/Inbox', [
            'pendingRequests' => $pendingRequests,
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
