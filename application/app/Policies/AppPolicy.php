<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\RoleEnum;
use App\Models\Model;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AppPolicy
{
    use HandlesAuthorization;

    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): bool
    {
        return $user->hasAnyRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]);
    }

    /**
     * Determine whether the user can view any models.
     */
    public function canViewAny(User $user): mixed
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     *
     * @throws \Exception
     */
    public function canView(User $user, $model): mixed
    {
        return $user->hasAnyRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]) || $this->ownsModel($user, $model);
    }

    /**
     * Determine whether the user can create models.
     */
    public function canCreate(User $user): bool
    {
        return $user->hasAnyRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function canUpdate(User $user, $model): mixed
    {
        return $user->hasAnyRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]) || $this->ownsModel($user, $model);
    }

    /** Determine whether the user can update the model.*/
    public function canUpdateAny(User $user): mixed
    {
        return $user->hasAnyRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function canDelete(User $user, $model): bool
    {
        return $user->hasAnyRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]) || $this->ownsModel($user, $model);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function canDeleteAny(User $user): mixed
    {
        return $user->hasAnyRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function canForceDelete(User $user, $model): bool
    {
        return $user->hasAnyRole([RoleEnum::super_admin()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function canForceDeleteAny(User $user): mixed
    {
        return $user->hasAnyRole([RoleEnum::super_admin()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function forceDelete(User $user, Model $model): mixed
    {
        return $user->hasAnyRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function canRestore(User $user, $model): bool
    {
        return $user->hasRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]) || $this->ownsModel($user, $model);
    }

    protected function ownsModel(User $user, $model): bool
    {
        if ($model instanceof User) {
            return $user->id === $model->id;
        }

        return $user->id === $model->user_id;
    }
}
