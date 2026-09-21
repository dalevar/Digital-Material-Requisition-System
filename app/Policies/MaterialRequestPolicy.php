<?php

namespace App\Policies;

use App\Enums\MaterialRequestStatus;
use App\Models\MaterialRequest;
use App\Models\User;

class MaterialRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, MaterialRequest $materialRequest): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isApprover() && ($materialRequest->approver_id === $user->id || $materialRequest->department_id === $user->department_id)) {
            return true;
        }

        return $materialRequest->requester_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isUser() || $user->isAdmin();
    }

    public function update(User $user, MaterialRequest $materialRequest): bool
    {
        if ($user->isAdmin()) {
            return ! in_array($materialRequest->status, [
                MaterialRequestStatus::REJECTED,
                MaterialRequestStatus::CANCELLED,
                MaterialRequestStatus::CANCELLED_AFTER_APPROVAL,
                MaterialRequestStatus::PROCESSING,
            ]);
        }

        if ($materialRequest->requester_id === $user->id) {
            return in_array($materialRequest->status, [
                MaterialRequestStatus::DRAFT,
                MaterialRequestStatus::COMPLETED,
                MaterialRequestStatus::APPROVED,
            ]);
        }

        return false;
    }

    public function approve(User $user, MaterialRequest $materialRequest): bool
    {
        if ($user->id === $materialRequest->requester_id) {
            return false; // NO SELF-APPROVAL
        }

        if (! in_array($materialRequest->status, [MaterialRequestStatus::SUBMITTED, MaterialRequestStatus::PENDING_APPROVAL])) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        return $user->isApprover() && ($materialRequest->approver_id === $user->id || $user->department_id === $materialRequest->department_id);
    }

    public function reject(User $user, MaterialRequest $materialRequest): bool
    {
        return $this->approve($user, $materialRequest);
    }

    public function cancelApproved(User $user, MaterialRequest $materialRequest): bool
    {
        return $user->isAdmin() && in_array($materialRequest->status, [MaterialRequestStatus::APPROVED, MaterialRequestStatus::PROCESSING]);
    }

    public function delete(User $user, MaterialRequest $materialRequest): bool
    {
        if ($materialRequest->status !== MaterialRequestStatus::DRAFT) {
            return false;
        }

        if ($user->isAdmin() || $user->isExecutive()) {
            return true;
        }

        if ($user->isApprover()) {
            return true;
        }

        return $materialRequest->requester_id === $user->id;
    }
}
