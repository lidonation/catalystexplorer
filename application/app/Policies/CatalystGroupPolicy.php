<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Enums\PermissionEnum;
use App\Models\CatalystGroup;
use Illuminate\Auth\Access\Response;

class CatalystGroupPolicy extends AppPolicy
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
    public function view(User $user, CatalystGroup $catalystGroup): bool
    {
        return parent::canView($user, $catalystGroup) || $user->hasAnyPermission([PermissionEnum::read_users()->value]);
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
    public function update(User $user, CatalystGroup $catalystGroup): bool
    {
        return parent::canUpdate($user, $catalystGroup) || $user->hasAnyPermission([PermissionEnum::update_users()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, CatalystGroup $catalystGroup): bool
    {
        return parent::canDelete($user, $catalystGroup) || $user->hasAnyPermission([PermissionEnum::delete_users()->value]);
    }
}
