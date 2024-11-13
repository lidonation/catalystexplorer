<?php declare(strict_types=1);

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\Campaign;
use App\Models\User;

class CampaignPolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return parent::canViewAny($user) || $user->hasAnyPermission([PermissionEnum::read_campaigns()->value]);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Campaign $campaign): bool
    {
        return parent::canView($user, $campaign) || $user->hasAnyPermission([PermissionEnum::read_campaigns()->value]);

    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return parent::canCreate($user) || $user->hasAnyPermission([PermissionEnum::create_campaigns()->value]);

    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Campaign $campaign): bool
    {
        return parent::canUpdate($user, $campaign) || $user->hasAnyPermission([PermissionEnum::update_campaigns()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Campaign $campaign): bool
    {
        return parent::canDelete($user, $campaign) || $user->hasAnyPermission([PermissionEnum::delete_campaigns()->value]);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Campaign $campaign): bool
    {
        return parent::canRestore($user, $campaign) || $user->hasAnyPermission([PermissionEnum::restore_campaigns()->value]);
    }
}
