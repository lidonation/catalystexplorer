<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\CatalystTally;

class CatalystTallyObserver
{
    /**
     * Handle the CatalystTally "created" event.
     */
    public function created(CatalystTally $catalystTally): void
    {
        //
    }

    /**
     * Handle the CatalystTally "updated" event.
     */
    public function saving(CatalystTally $catalystTally): void
    {
        $catalystTally->updated_at = now();
    }

    /**
     * Handle the CatalystTally "deleted" event.
     */
    public function deleted(CatalystTally $catalystTally): void
    {
        //
    }

    /**
     * Handle the CatalystTally "restored" event.
     */
    public function restored(CatalystTally $catalystTally): void
    {
        //
    }
}
