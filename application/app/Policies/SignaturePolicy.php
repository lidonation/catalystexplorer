<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Signature;
use App\Models\User;

class SignaturePolicy extends AppPolicy
{
    /**
     * Determine whether the user can view any signatures (wallets).
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the signature (wallet).
     */
    public function view(?User $user, Signature $signature): bool
    {
        return parent::canView($user, $signature);
    }

    /**
     * Determine whether the user can update the signature (wallet).
     */
    public function update(User $user, Signature $signature): bool
    {
        return parent::canUpdate($user, $signature);
    }

    /**
     * Determine whether the user can delete the signature (wallet).
     */
    public function delete(User $user, Signature $signature): bool
    {
        return parent::canDelete($user, $signature);
    }

    /**
     * Determine whether the user can restore the signature (wallet).
     */
    public function restore(User $user, Signature $signature): bool
    {
        return parent::canRestore($user, $signature);
    }
}
