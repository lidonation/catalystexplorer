<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Enums\RoleEnum;
use App\Enums\PermissionEnum;
use Illuminate\Auth\Access\Response;

class UserPolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyPermission([PermissionEnum::read_users()->value]) || $this->canViewAny($user);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return $user->hasAnyPermission([PermissionEnum::read_users()->value]) ||
            $this->canView($user, $model);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyPermission([PermissionEnum::create_users()->value]) || $this->canCreate($user);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        return $user->hasAnyPermission([PermissionEnum::update_users()->value]) ||
            $this->canUpdateAny($user) || $this->ownsModel($user, $model);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        return $user->hasAnyPermission([PermissionEnum::delete_users()->value]) ||
            $this->canDelete($user, $model);
    }

}
