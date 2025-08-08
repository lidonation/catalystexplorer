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

    public function before(?User $user = null, $ability) {
        dd($user);
        return true;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function canViewAny(?User $user = null): mixed
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     *
     * @throws \Exception
     */
    public function canView(?User $user = null, $model): mixed
    {
        return $user->hasAnyRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]) || $this->ownsModel($user, $model);
    }

    /**
     * Determine whether the user can create models.
     */
    public function canCreate(?User $user = null): bool
    {
        return $user->hasAnyRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function canUpdate(?User $user = null, $model): mixed
    {
        return $user->hasAnyRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]) || $this->ownsModel($user, $model);
    }

    /** Determine whether the user can update the model.*/
    public function canUpdateAny(?User $user = null): mixed
    {
        return $user->hasAnyRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function canDelete(?User $user = null, $model): bool
    {
        return $user->hasAnyRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]) || $this->ownsModel($user, $model);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function canDeleteAny(?User $user = null): mixed
    {
        return $user->hasAnyRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function canForceDelete(?User $user = null, $model): bool
    {
        return $user->hasAnyRole([RoleEnum::super_admin()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function canForceDeleteAny(?User $user = null): mixed
    {
        return $user->hasAnyRole([RoleEnum::super_admin()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function forceDelete(?User $user = null, Model $model): mixed
    {
        return $user->hasAnyRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function canRestore(?User $user = null, $model): bool
    {
        return $user->hasRole([RoleEnum::admin()->value, RoleEnum::super_admin()->value]) || $this->ownsModel($user, $model);
    }

    protected function ownsModel(?User $user = null, $model): bool
    {
        if ($model instanceof User) {
            return $user->id === $model->id;
        }

        return $user->id === $model->user_id;
    }
}
