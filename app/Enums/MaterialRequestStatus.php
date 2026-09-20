<?php

namespace App\Enums;

enum MaterialRequestStatus: string
{
    case DRAFT = 'DRAFT';
    case SUBMITTED = 'SUBMITTED';
    case PENDING_APPROVAL = 'PENDING_APPROVAL';
    case APPROVED = 'APPROVED';
    case REJECTED = 'REJECTED';
    case PROCESSING = 'PROCESSING';
    case COMPLETED = 'COMPLETED';
    case CANCELLED = 'CANCELLED';
    case CANCELLED_AFTER_APPROVAL = 'CANCELLED_AFTER_APPROVAL';

    public function canTransitionTo(self $target): bool
    {
        return match ($this) {
            self::DRAFT => in_array($target, [self::SUBMITTED, self::PENDING_APPROVAL, self::CANCELLED]),
            self::SUBMITTED, self::PENDING_APPROVAL => in_array($target, [self::APPROVED, self::REJECTED, self::CANCELLED]),
            self::APPROVED => in_array($target, [self::PROCESSING, self::COMPLETED, self::CANCELLED_AFTER_APPROVAL, self::CANCELLED]),
            self::PROCESSING => in_array($target, [self::COMPLETED, self::CANCELLED_AFTER_APPROVAL]),
            self::REJECTED => in_array($target, [self::DRAFT, self::SUBMITTED, self::PENDING_APPROVAL]),
            self::COMPLETED, self::CANCELLED, self::CANCELLED_AFTER_APPROVAL => false,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::SUBMITTED => 'Submitted',
            self::PENDING_APPROVAL => 'Pending Approval',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
            self::PROCESSING => 'Processing',
            self::COMPLETED => 'Completed',
            self::CANCELLED => 'Cancelled',
            self::CANCELLED_AFTER_APPROVAL => 'Cancelled After Approval',
        };
    }

    public function badgeColor(): string
    {
        return match ($this) {
            self::DRAFT => 'neutral',
            self::SUBMITTED => 'info',
            self::PENDING_APPROVAL => 'warning',
            self::APPROVED => 'success',
            self::REJECTED => 'danger',
            self::PROCESSING => 'primary',
            self::COMPLETED => 'success',
            self::CANCELLED => 'neutral',
            self::CANCELLED_AFTER_APPROVAL => 'danger',
        };
    }
}
