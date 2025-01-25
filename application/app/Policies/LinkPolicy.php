<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Link;
use App\Models\User;
use App\Enums\PermissionEnum;

class LinkPolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return parent::canViewAny($user) || $user->hasAnyPermission([PermissionEnum::read_links()->value]);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Link $link): bool
    {
        return $user->hasAnyPermission([PermissionEnum::read_links()->value]);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyPermission([PermissionEnum::create_links()->value]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Link $link): bool
    {
        return $user->hasAnyPermission([PermissionEnum::update_links()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Link $link): bool
    {
        return $user->hasAnyPermission([PermissionEnum::delete_links()->value]);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Link $link): bool
    {
        return $user->hasAnyPermission([PermissionEnum::restore_links()->value]);
    }

}