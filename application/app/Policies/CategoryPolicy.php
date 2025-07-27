<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\Category;
use App\Models\User;

class CategoryPolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return parent::canViewAny($user) || $user->hasAnyPermission([PermissionEnum::read_categories()->value]);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Category $category): bool
    {
        return parent::canView($user, $category) || $user->hasAnyPermission([PermissionEnum::read_categories()->value]);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return parent::canCreate($user) || $user->hasAnyPermission([PermissionEnum::create_categories()->value]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Category $category): bool
    {
        return parent::canUpdate($user, $category) || $user->hasAnyPermission([PermissionEnum::update_categories()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Category $category): bool
    {
        return parent::canDelete($user, $category) || $user->hasAnyPermission([PermissionEnum::delete_categories()->value]);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Category $category): bool
    {
        return parent::canRestore($user, $category) || $user->hasAnyPermission([PermissionEnum::restore_categories()->value]);
    }
}
