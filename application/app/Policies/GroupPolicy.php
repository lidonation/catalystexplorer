<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Enums\PermissionEnum;
use App\Models\Group;
use Illuminate\Auth\Access\Response;

class GroupPolicy extends AppPolicy
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
    public function view(User $user, Group $group): bool
    {
        return parent::canView($user, $group) || $user->hasAnyPermission([PermissionEnum::read_users()->value]);
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
    public function update(User $user, Group $group): bool
    {
        return parent::canUpdate($user, $group) || $user->hasAnyPermission([PermissionEnum::update_users()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Group $group): bool
    {
        return parent::canDelete($user, $group) || $user->hasAnyPermission([PermissionEnum::delete_users()->value]);
    }
}
