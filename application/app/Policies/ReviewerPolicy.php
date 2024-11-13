<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Reviewer;
use App\Models\User;

class ReviewerPolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return parent::canViewAny($user);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Reviewer $model): bool
    {
        return parent::canView($user, $model);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return parent::canCreate($user);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Reviewer $model): bool
    {
        return parent::canUpdate($user, $model);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Reviewer $model): bool
    {
        return parent::canDelete($user, $model);
    }
}
