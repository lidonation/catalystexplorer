<?php declare(strict_types=1);

namespace App\Policies;

use App\Models\Community;
use App\Enums\PermissionEnum;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CommunityPolicy extends AppPolicy
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
    public function view(User $user, Community $community): bool
    {
        return parent::canView($user, $community) || $user->hasAnyPermission([PermissionEnum::read_users()->value]);
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
    public function update(User $user, Community $community): bool
    {
        return parent::canUpdate($user, $community) || $user->hasAnyPermission([PermissionEnum::update_users()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Community $community): bool
    {
        return parent::canDelete($user, $community) || $user->hasAnyPermission([PermissionEnum::delete_users()->value]);
    }
}
