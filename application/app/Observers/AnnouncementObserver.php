<?php

declare(strict_types=1);

namespace App\Observers;

use App\Actions\FillCurrentUserId;
use App\Models\Announcement;

class AnnouncementObserver
{
    /** Handle the Announcement "created" event.
     * @throws \Exception
     */
    public function creating(Announcement $announcement): void
    {
        app(FillCurrentUserId::class)
            ->handle($announcement);
    }

    /** Handle the Announcement "created" event.*/
    public function created(Announcement $announcement): void
    {
        //
    }

    /** Handle the Announcement "updated" event.*/
    public function updated(Announcement $announcement): void
    {
        //
    }

    /** Handle the Announcement "deleted" event.*/
    public function deleted(Announcement $announcement): void
    {
        //
    }

    /** Handle the Announcement "restored" event.*/
    public function restored(Announcement $announcement): void
    {
        //
    }

    /** Handle the Announcement "force deleted" event.*/
    public function forceDeleted(Announcement $announcement): void
    {
        //
    }
}
