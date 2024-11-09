<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\IdeascaleProfile;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class IdeascaleProfilePolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyPermission([PermissionEnum::read_links()->value]) || $this->canViewAny($user);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, IdeascaleProfile $ideascaleProfile): bool
    {
        return $user->hasAnyPermission([PermissionEnum::read_links()->value]) || $this->canView($user, $catalystUser);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyPermission([PermissionEnum::create_links()->value]) || $this->canCreate($user);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, IdeascaleProfile $ideascaleProfile): bool
    {
        return $user->hasAnyPermission([PermissionEnum::update_links()->value]) || $this->canUpdateAny($user);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, IdeascaleProfile $ideascaleProfile): bool
    {
        return $user->hasAnyPermission([PermissionEnum::delete_links()->value]) || $this->canDeleteAny($user);
    }
}
