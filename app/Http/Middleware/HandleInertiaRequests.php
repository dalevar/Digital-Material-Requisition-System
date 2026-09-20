<?php

namespace App\Http\Middleware;

use App\Enums\MaterialRequestStatus;
use App\Models\MaterialRequest;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $pendingApprovalsCount = 0;
        $unreadNotificationsCount = 0;

        if ($user) {
            $unreadNotificationsCount = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();

            if ($user->isAdmin()) {
                $pendingApprovalsCount = MaterialRequest::whereIn('status', [
                    MaterialRequestStatus::SUBMITTED,
                    MaterialRequestStatus::PENDING_APPROVAL,
                ])->count();
            } elseif ($user->isApprover()) {
                $pendingApprovalsCount = MaterialRequest::whereIn('status', [
                    MaterialRequestStatus::SUBMITTED,
                    MaterialRequestStatus::PENDING_APPROVAL,
                ])->where(function ($q) use ($user) {
                    $q->where('approver_id', $user->id)
                        ->orWhere('department_id', $user->department_id);
                })->count();
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role?->name,
                    'department_id' => $user->department_id,
                    'department' => $user->department ? [
                        'id' => $user->department->id,
                        'name' => $user->department->name,
                    ] : null,
                    'plant' => $user->plant ? [
                        'id' => $user->plant->id,
                        'name' => $user->plant->name,
                    ] : null,
                ] : null,
            ],
            'pendingApprovalsCount' => $pendingApprovalsCount,
            'unreadNotificationsCount' => $unreadNotificationsCount,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
        ];
    }
}
