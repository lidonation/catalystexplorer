<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\RoleEnum;
use App\Models\Model;
use App\Models\ModelEmbedding;
use App\Models\User;

class ModelEmbeddingPolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return parent::canViewAny($user) || $user->hasAnyRole([
            RoleEnum::admin()->value,
            RoleEnum::super_admin()->value,
            RoleEnum::editor()->value,
        ]);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ModelEmbedding $modelEmbedding): bool
    {
        return parent::canView($user, $modelEmbedding) || $user->hasAnyRole([
            RoleEnum::admin()->value,
            RoleEnum::super_admin()->value,
            RoleEnum::editor()->value,
        ]);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return parent::canCreate($user) || $user->hasAnyRole([
            RoleEnum::admin()->value,
            RoleEnum::super_admin()->value,
        ]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ModelEmbedding $modelEmbedding): bool
    {
        return parent::canUpdate($user, $modelEmbedding) || $user->hasAnyRole([
            RoleEnum::admin()->value,
            RoleEnum::super_admin()->value,
        ]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ModelEmbedding $modelEmbedding): bool
    {
        return $user->hasAnyRole([
            RoleEnum::admin()->value,
            RoleEnum::super_admin()->value,
        ]);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ModelEmbedding $modelEmbedding): bool
    {
        return $user->hasAnyRole([
            RoleEnum::admin()->value,
            RoleEnum::super_admin()->value,
        ]);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ModelEmbedding|Model $modelEmbedding): bool
    {
        return $user->hasAnyRole([RoleEnum::super_admin()->value]);
    }
}
