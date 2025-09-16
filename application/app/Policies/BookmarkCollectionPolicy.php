<?php

declare(strict_types=1);

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
        return $user->hasAnyPermission([PermissionEnum::read_bookmark_items()->value]);
    }

    /**
     * Determine whether the user can view the model.
     *
     * @throws \Exception
     */
    public function view(User $user, BookmarkCollection $bookmarkCollection): bool
    {
        return parent::canView($user, $bookmarkCollection) ||
               $this->isCollaborator($user, $bookmarkCollection) ||
               $user->hasAnyPermission([PermissionEnum::read_bookmark_items()->value]);
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
        return parent::canUpdate($user, $bookmarkCollection) ||
               $this->isCollaborator($user, $bookmarkCollection) ||
               $user->hasAnyPermission([PermissionEnum::update_bookmark_items()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     * Note: Only owners can delete collections, not collaborators.
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

    /**
     * Determine whether the user can add items to the bookmark collection.
     */
    public function addItems(User $user, BookmarkCollection $bookmarkCollection): bool
    {
        return parent::canUpdate($user, $bookmarkCollection) ||
               $this->isCollaborator($user, $bookmarkCollection) ||
               $user->hasAnyPermission([PermissionEnum::create_bookmark_items()->value]);
    }

    /**
     * Determine whether the user can remove items from the bookmark collection.
     */
    public function removeItems(User $user, BookmarkCollection $bookmarkCollection): bool
    {
        return parent::canUpdate($user, $bookmarkCollection) ||
               $this->isCollaborator($user, $bookmarkCollection) ||
               $user->hasAnyPermission([PermissionEnum::delete_bookmark_items()->value]);
    }

    /**
     * Check if the user is a collaborator on the bookmark collection.
     */
    private function isCollaborator(User $user, BookmarkCollection $bookmarkCollection): bool
    {
        return $bookmarkCollection->contributors()->where('user_id', $user->id)->exists();
    }
}
