<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\CatalystVotingPower;
use App\Models\User;
use Illuminate\Auth\Access\Response;
use App\Enums\PermissionEnum;
use App\Models\Model;

class CatalystVotingPowerPolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return parent::canViewAny($user) || $user->hasAnyPermission([PermissionEnum::read_catalyst_voting_power()->value]);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, CatalystVotingPower $catalystVotingPower): bool
    {
        return parent::canView($user, $catalystVotingPower) || $user->hasAnyPermission([PermissionEnum::read_catalyst_voting_power()->value]);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return parent::canCreate($user) || $user->hasAnyPermission([PermissionEnum::create_catalyst_voting_power()->value]);

    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, CatalystVotingPower $catalystVotingPower): bool
    {
        return parent::canUpdate($user, $catalystVotingPower) || $user->hasAnyPermission([PermissionEnum::update_catalyst_voting_power()->value]);

    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, CatalystVotingPower $catalystVotingPower): bool
    {
        return parent::canDelete($user, $catalystVotingPower) || $user->hasAnyPermission([PermissionEnum::deleted_catalyst_voting_power()->value]);

    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, CatalystVotingPower $catalystVotingPower): bool
    {
        return parent::canRestore($user, $catalystVotingPower) || $user->hasAnyPermission([PermissionEnum::restore_catalyst_voting_power()->value]);

    }
}
