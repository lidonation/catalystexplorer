<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\BookmarkItem;
use App\Models\User;

class BookmarkItemPolicy extends AppPolicy
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
    public function view(User $user, BookmarkItem $bookmarkItem): bool
    {
        return parent::canView($user, $bookmarkItem) || $user->hasAnyPermission([PermissionEnum::read_bookmark_items()->value]);
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
    public function update(User $user, BookmarkItem $bookmarkItem): bool
    {
        return parent::canUpdate($user, $bookmarkItem) || $user->hasAnyPermission([PermissionEnum::update_bookmark_items()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, BookmarkItem $bookmarkItem): bool
    {
        return parent::canDelete($user, $bookmarkItem) || $user->hasAnyPermission([PermissionEnum::delete_bookmark_items()->value]);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, BookmarkItem $bookmarkItem): bool
    {
        return parent::canRestore($user, $bookmarkItem) || $user->hasAnyPermission([PermissionEnum::restore_bookmark_items()->value]);
    }
}
