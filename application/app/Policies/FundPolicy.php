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
     *
     * @throws \Exception
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyPermission([PermissionEnum::read_funds()->value]) ||
            $this->canViewAny($user);
    }

    /**
     * Determine whether the user can view the model.
     *
     *
     * @throws \Exception
     */
    public function view(User $user, Fund $fund): mixed
    {
        return $user->hasAnyPermission([PermissionEnum::read_funds()->value]) ||
            $this->canView($user, $fund);
    }

    /**
     * Determine whether the user can create models.
     *
     *
     * @throws \Exception
     */
    public function create(User $user): bool
    {
        return $user->hasAnyPermission([PermissionEnum::create_funds()->value]) || $this->canCreate($user);
    }

    /**
     * Determine whether the user can update the model.
     *
     *
     * @throws \Exception
     */
    public function update(User $user, Fund $fund): mixed
    {
        return $user->hasAnyPermission([PermissionEnum::update_funds()->value]) ||
            $this->canUpdate($user);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Fund $fund): mixed
    {
        return $this->canDelete($user);
    }
}
