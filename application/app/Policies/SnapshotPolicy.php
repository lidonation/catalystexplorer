<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\Snapshot;
use App\Models\User;

class SnapshotPolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return parent::canViewAny($user) || $user->hasAnyPermission([PermissionEnum::read_catalyst_snapshot()->value]);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Snapshot $catalystSnapshot): bool
    {
        return parent::canViewAny($user, $catalystSnapshot) || $user->hasAnyPermission([PermissionEnum::read_catalyst_snapshot()->value]);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return parent::canCreate($user) || $user->hasAnyPermission([PermissionEnum::create_catalyst_snapshot()->value]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Snapshot $catalystSnapshot): bool
    {
        return parent::canUpdate($user, $catalystSnapshot) || $user->hasAnyPermission([PermissionEnum::update_catalyst_snapshot()->value]);

    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Snapshot $catalystSnapshot): bool
    {
        return parent::canDelete($user, $catalystSnapshot) || $user->hasAnyPermission([PermissionEnum::delete_catalyst_snapshot()->value]);

    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Snapshot $catalystSnapshot): bool
    {
        return parent::canRestore($user, $catalystSnapshot) || $user->hasAnyPermission([PermissionEnum::restore_catalyst_snapshot()->value]);
    }
}
