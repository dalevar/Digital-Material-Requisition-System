<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Material;
use App\Models\MaterialRequest;
use App\Models\Plant;
use App\Models\User;
use App\Services\InventoryService;
use App\Services\MaterialRequestService;
use App\Services\PdfService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MaterialRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = MaterialRequest::with(['requester', 'approver', 'department', 'plant', 'items.material']);

        if (! $user->isAdmin()) {
            if ($user->isApprover()) {
                $query->where(function ($q) use ($user) {
                    $q->where('approver_id', $user->id)
                        ->orWhere('department_id', $user->department_id);
                });
            } else {
                $query->where('requester_id', $user->id);
            }
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('request_no', 'LIKE', "%{$search}%")
                    ->orWhere('no_doc', 'LIKE', "%{$search}%")
                    ->orWhereHas('requester', fn ($rq) => $rq->where('name', 'LIKE', "%{$search}%"));
            });
        }

        $requests = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Requests/Index', [
            'requests' => $requests,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function create(): Response
    {
        $user = auth()->user();
        $materials = Material::with('stockBalance')->where('status', 'ACTIVE')->get()->map(function ($m) {
            return [
                'id' => $m->id,
                'material_number' => $m->material_number,
                'description' => $m->description,
                'uom' => $m->uom,
                'soh' => $m->soh,
                'storage_location' => $m->storage_location,
            ];
        });

        $approvers = User::whereHas('role', fn ($r) => $r->whereIn('name', ['APPROVER', 'EXECUTIVE']))
            ->where('id', '!=', $user->id)
            ->get();

        $departments = Department::where('is_active', true)->get();
        $plants = Plant::where('is_active', true)->get();

        return Inertia::render('Requests/Create', [
            'materials' => $materials,
            'approvers' => $approvers,
            'departments' => $departments,
            'plants' => $plants,
        ]);
    }

    public function store(Request $request, MaterialRequestService $service): RedirectResponse
    {
        $validated = $request->validate([
            'no_doc' => ['nullable', 'string', 'max:100'],
            'request_date' => ['required', 'date'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'plant_id' => ['nullable', 'exists:plants,id'],
            'gl_account' => ['nullable', 'string', 'max:50'],
            'pwo_no' => ['nullable', 'string', 'max:50'],
            'pur_org' => ['nullable', 'string', 'max:50'],
            'pur_group' => ['nullable', 'string', 'max:50'],
            'cost_center' => ['nullable', 'string', 'max:50'],
            'reason' => ['nullable', 'string'],
            'approver_id' => ['nullable', 'exists:users,id'],
            'action' => ['required', 'in:draft,submit'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.material_id' => ['required', 'exists:materials,id'],
            'items.*.qty' => ['required', 'numeric', 'gt:0'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.note' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $mr = $service->createDraft($user, $validated, $validated['items']);

        if ($validated['action'] === 'submit') {
            $service->submitRequest($mr, $user);

            return redirect()->route('requests.show', $mr->id)->with('success', "Request {$mr->request_no} created and submitted successfully.");
        }

        return redirect()->route('requests.show', $mr->id)->with('success', "Draft request {$mr->request_no} saved successfully.");
    }

    public function show(MaterialRequest $materialRequest): Response
    {
        $this->authorize('view', $materialRequest);

        $materialRequest->load([
            'requester',
            'approver',
            'department',
            'plant',
            'items.material.stockBalance',
            'approvalHistories.approver',
        ]);

        $plants = Plant::where('is_active', true)->get();

        return Inertia::render('Requests/Show', [
            'request' => $materialRequest,
            'plants' => $plants,
        ]);
    }

    public function submit(MaterialRequest $materialRequest, MaterialRequestService $service): RedirectResponse
    {
        $this->authorize('update', $materialRequest);
        $service->submitRequest($materialRequest, auth()->user());

        return back()->with('success', "Request {$materialRequest->request_no} submitted for approval.");
    }

    public function supplement(MaterialRequest $materialRequest, Request $request, MaterialRequestService $service): RedirectResponse
    {
        $this->authorize('update', $materialRequest);

        $validated = $request->validate([
            'no_doc' => ['nullable', 'string', 'max:100'],
            'plant_id' => ['nullable', 'exists:plants,id'],
            'gl_account' => ['nullable', 'string', 'max:50'],
            'pwo_no' => ['nullable', 'string', 'max:50'],
            'pur_org' => ['nullable', 'string', 'max:50'],
            'pur_group' => ['nullable', 'string', 'max:50'],
            'cost_center' => ['nullable', 'string', 'max:50'],
            'reason' => ['required', 'string'],
        ]);

        $service->supplementMRF($materialRequest, $validated, $request->user(), $validated['reason']);

        return back()->with('success', 'Approved request MRF fields updated with audit logging.');
    }

    public function cancelApproved(MaterialRequest $materialRequest, Request $request, MaterialRequestService $service, InventoryService $inventoryService): RedirectResponse
    {
        $this->authorize('cancelApproved', $materialRequest);

        $validated = $request->validate([
            'cancellation_reason' => ['required', 'string', 'min:3'],
        ]);

        $service->cancelApprovedRequest($materialRequest, $request->user(), $validated['cancellation_reason'], $inventoryService);

        return back()->with('success', 'Approved request cancelled by Admin and stock reversed if applicable.');
    }

    public function downloadPdf(MaterialRequest $materialRequest, PdfService $pdfService)
    {
        $this->authorize('view', $materialRequest);

        return $pdfService->downloadMrfPdf($materialRequest);
    }
}
