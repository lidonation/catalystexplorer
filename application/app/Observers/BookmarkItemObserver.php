<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Proposal;

class BookmarkItemObserver
{
    /**
     * Handle the BookmarkItem "created" event.
     */
    public function creating(BookmarkItem $item)
    {
        $collection = BookmarkCollection::find($item->bookmark_collection_id);

        if (! $collection) {
            return false;
        }

        if ($collection->fund_id && ($item->model_type !== Proposal::class || $item->model_type == 'Proposal')) {
            return false;
        }

        return true;
    }

    /**
     * Handle the BookmarkItem "updated" event.
     */
    public function updated(BookmarkItem $bookmarkItem): void
    {
        //
    }

    /**
     * Handle the BookmarkItem "deleted" event.
     */
    public function deleted(BookmarkItem $bookmarkItem): void
    {
        //
    }

    /**
     * Handle the BookmarkItem "restored" event.
     */
    public function restored(BookmarkItem $bookmarkItem): void
    {
        //
    }

    /**
     * Handle the BookmarkItem "force deleted" event.
     */
    public function forceDeleted(BookmarkItem $bookmarkItem): void
    {
        //
    }
}
