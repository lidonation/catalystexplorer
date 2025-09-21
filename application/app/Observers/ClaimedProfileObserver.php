<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Pivot\ClaimedProfile;
use Illuminate\Support\Str;

/**
 * ClaimedProfile Observer
 *
 * Handles automatic population of UUID and timestamp fields
 * when ClaimedProfile records are created.
 *
 * Note: This observer handles both direct model creation and
 * pivot attachment via BelongsToMany relationships.
 */
class ClaimedProfileObserver
{
    public function creating(ClaimedProfile $claimedProfile): void
    {
        // Auto-set claimed_at timestamp if not already set
        if (empty($claimedProfile->claimed_at)) {
            $claimedProfile->claimed_at = now();
        }

        if (empty($claimedProfile->id)) {
            $claimedProfile->id = (string) Str::uuid();
        }
    }

    /**
     * Handle the ClaimedProfile "created" event.
     *
     * Called after the model has been successfully saved.
     */
    public function created(ClaimedProfile $claimedProfile): void {}

    /**
     * Handle the ClaimedProfile "updating" event.
     */
    public function updating(ClaimedProfile $claimedProfile): void
    {
        // Ensure UUID is never overwritten during updates
        if ($claimedProfile->isDirty('id') && ! empty($claimedProfile->getOriginal('id'))) {
            $claimedProfile->id = $claimedProfile->getOriginal('id');
        }
    }

    /**
     * Handle the ClaimedProfile "deleting" event.
     */
    public function deleting(ClaimedProfile $claimedProfile): void {}

    /**
     * Handle the ClaimedProfile "restored" event.
     */
    public function restored(ClaimedProfile $claimedProfile): void {}

    /**
     * Handle the ClaimedProfile "force deleted" event.
     */
    public function forceDeleted(ClaimedProfile $claimedProfile): void {}
}
