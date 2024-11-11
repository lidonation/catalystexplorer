<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Enums\RoleEnum;
use App\Enums\PermissionEnum;
use Illuminate\Auth\Access\Response;

class ReviewPolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return parent::canViewAny($user) || $user->hasAnyPermission([PermissionEnum::read_users()->value]);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return parent::canView($user, $model) || $user->hasAnyPermission([PermissionEnum::read_users()->value]);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return parent::canCreate($user) || $user->hasAnyPermission([PermissionEnum::create_users()->value]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        return parent::canUpdate($user, $model) || $user->hasAnyPermission([PermissionEnum::update_users()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        return parent::canDelete($user, $model) || $user->hasAnyPermission([PermissionEnum::delete_users()->value]);
    }
}
