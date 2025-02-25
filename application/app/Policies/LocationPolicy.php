<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\Link;
use App\Models\User;

class LocationPolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return parent::canViewAny($user) || $user->hasAnyPermission([PermissionEnum::read_locations()->value]);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Link $link): bool
    {
        return parent::canView($user, $link) || $user->hasAnyPermission([PermissionEnum::read_locations()->value]);

    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return parent::canCreate($user) || $user->hasAnyPermission([PermissionEnum::create_locations()->value]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Link $link): bool
    {
        return parent::canView($user, $link) || $user->hasAnyPermission([PermissionEnum::update_locations()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Link $link): bool
    {
        return parent::canDelete($user, $link) || $user->hasAnyPermission([PermissionEnum::delete_locations()->value]);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Link $link): bool
    {
        return parent::canRestore($user, $link) || $user->hasAnyPermission([PermissionEnum::restore_locations()->value]);
    }
}
