<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ReviewModerationReviewer;
use App\Models\User;

class ReviewModerationReviewerPolicy extends AppPolicy
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
    public function view(User $user, ReviewModerationReviewer $model): bool
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
    public function update(User $user, ReviewModerationReviewer $model): bool
    {
        return parent::canUpdate($user, $model);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ReviewModerationReviewer $model): bool
    {
        return parent::canDelete($user, $model);
    }
}
