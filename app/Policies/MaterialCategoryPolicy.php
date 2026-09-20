<?php

namespace App\Policies;

use App\Models\MaterialCategory;
use App\Models\User;

class MaterialCategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, MaterialCategory $category): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, MaterialCategory $category): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, MaterialCategory $category): bool
    {
        return $user->isAdmin();
    }
}
