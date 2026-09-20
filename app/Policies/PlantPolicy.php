<?php

namespace App\Policies;

use App\Models\Plant;
use App\Models\User;

class PlantPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Plant $plant): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Plant $plant): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Plant $plant): bool
    {
        return $user->isAdmin();
    }
}
