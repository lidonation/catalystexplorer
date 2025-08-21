<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\CatalystDrepUser;
use App\Models\User;

class CatalystDrepUserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, CatalystDrepUser $catalystDrepUser): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, CatalystDrepUser $catalystDrepUser): bool
    {
        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, CatalystDrepUser $catalystDrepUser): bool
    {
        return true;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, CatalystDrepUser $catalystDrepUser): bool
    {
        return true;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, CatalystDrepUser $catalystDrepUser): bool
    {
        return true;
    }

    /**
     * Determine whether the user can attach any model to the parent.
     */
    public function attachAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can attach models to the parent.
     */
    public function attach(User $user, CatalystDrepUser $catalystDrepUser): bool
    {
        return true;
    }

    /**
     * Determine whether the user can detach models from the parent.
     */
    public function detach(User $user, CatalystDrepUser $catalystDrepUser): bool
    {
        return true;
    }

    /**
     * Determine whether the user can detach any model from the parent.
     */
    public function detachAny(User $user): bool
    {
        return true;
    }
}
