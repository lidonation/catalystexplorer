<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\Fund;
use App\Models\User;

class FundPolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any models.
     *
     * @throws \Exception
     */
    public function viewAny(User $user): bool
    {
        return parent::canViewAny($user) || $user->hasAnyPermission([PermissionEnum::read_funds()->value]);
    }

    /**
     * Determine whether the user can view the model.
     *
     * @throws \Exception
     */
    public function view(User $user, Fund $fund): bool
    {
        return parent::canView($user, $fund) || $user->hasAnyPermission([PermissionEnum::read_funds()->value]);
    }

    /**
     * Determine whether the user can create models.
     *
     * @throws \Exception
     */
    public function create(User $user): bool
    {
        return parent::canCreate($user) || $user->hasAnyPermission([PermissionEnum::create_funds()->value]);
    }

    /**
     * Determine whether the user can update the model.
     *
     * @throws \Exception
     */
    public function update(User $user, Fund $fund): bool
    {
        return parent::canUpdate($user, $fund) || $user->hasAnyPermission([PermissionEnum::update_funds()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @throws \Exception
     */
    public function delete(User $user, Fund $fund): bool
    {
        return parent::canDelete($user, $fund) || $user->hasAnyPermission([PermissionEnum::delete_funds()->value]);
    }
}
