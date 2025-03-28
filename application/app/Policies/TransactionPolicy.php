<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\Transaction;
use App\Models\User;

class TransactionPolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return parent::canViewAny($user) || $user->hasAnyPermission([PermissionEnum::read_transactions()->value]);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Transaction $transaction): bool
    {
        return parent::canView($user, $transaction) || $user->hasAnyPermission([PermissionEnum::read_users()->value]);
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
    public function update(User $user, Transaction $transaction): bool
    {
        return parent::canUpdate($user, $transaction) || $user->hasAnyPermission([PermissionEnum::update_transactions()->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Transaction $transaction): bool
    {
        return parent::canDelete($user, $transaction) || $user->hasAnyPermission([PermissionEnum::delete_transactions()->value]);
    }
}
