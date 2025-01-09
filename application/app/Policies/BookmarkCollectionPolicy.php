<?php

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\BookmarkCollection;
use App\Models\User;

class BookmarkCollectionPolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return parent::canViewAny($user) || $user->hasAnyPermission([PermissionEnum::read_bookmark_items()->value]);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, BookmarkCollection $bookmarkCollection): bool
    {
        return parent::canView($user, $bookmarkCollection) || $user->hasAnyPermission([PermissionEnum::read_bookmark_items()->value]);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return parent::canCreate($user) || $user->hasAnyPermission([PermissionEnum::create_bookmark_items()->value]);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, BookmarkCollection $bookmarkCollection): bool
    {
        return parent::canUpdate($user, $bookmarkCollection) || $user->hasAnyPermission([PermissionEnum::update_bookmark_items()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, BookmarkCollection $bookmarkCollection): bool
    {
        return parent::canDelete($user, $bookmarkCollection) || $user->hasAnyPermission([PermissionEnum::delete_bookmark_items()->value]);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, BookmarkCollection $bookmarkCollection): bool
    {
        return parent::canRestore($user, $bookmarkCollection) || $user->hasAnyPermission([PermissionEnum::restore_bookmark_items()->value]);
    }
}
