<?php

namespace App\Policies;

use App\Models\User;

class StockPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function stockIn(User $user): bool
    {
        return $user->isAdmin();
    }

    public function stockAdjustment(User $user): bool
    {
        return $user->isAdmin();
    }

    public function issueStock(User $user): bool
    {
        return $user->isAdmin();
    }
}
