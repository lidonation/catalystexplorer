<?php

namespace App\Jobs;

use App\Enums\BookmarkableType;
use App\Events\BookmarkItemsStreamCompleted;
use App\Events\BookmarkItemsStreamStarted;
use App\Events\BookmarkItemStreamed;
use App\Models\BookmarkCollection;
use App\Models\Proposal;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Str;

class StreamBookmarkItems implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public BookmarkCollection $bookmarkCollection,
        public string $type = 'proposals',
        public ?string $search = null,
        public ?string $sortBy = 'updated_at',
        public ?string $sortOrder = 'desc'
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $model_type = BookmarkableType::from(Str::kebab($this->type))->getModelClass();

        $relationshipsMap = [
            Proposal::class => ['users', 'fund', 'campaign', 'schedule'],
        ];

        $countMap = [
            // Add count relationships if needed
        ];

        $relationships = $relationshipsMap[$model_type] ?? [];
        $counts = $countMap[$model_type] ?? [];

        // Get bookmark item IDs for this collection and model type
        $bookmarkItemIds = $this->bookmarkCollection->items
            ->where('model_type', $model_type)
            ->pluck('model_id')
            ->toArray();

        if (empty($bookmarkItemIds)) {
            event(new BookmarkItemsStreamStarted($this->bookmarkCollection->id, 0));
            event(new BookmarkItemsStreamCompleted($this->bookmarkCollection->id, 0));

            return;
        }

        // Build query
        $bookmarkItemsQuery = $this->bookmarkCollection->items()
            ->where('model_type', $model_type)
            ->with(['model' => function ($query) use ($relationships, $counts) {
                if (! empty($relationships)) {
                    $query->with($relationships);
                }
                if (! empty($counts)) {
                    $query->withCount($counts);
                }
            }]);

        // Apply search if provided
        if ($this->search) {
            $searchBuilder = $model_type::search($this->search);

            if ($this->sortBy && $this->sortOrder) {
                $searchBuilder->orderBy($this->sortBy, $this->sortOrder);
            }

            $searchResults = $searchBuilder->get();
            $searchIds = $searchResults->pluck('id')->toArray();

            if (empty($searchIds)) {
                event(new BookmarkItemsStreamStarted($this->bookmarkCollection->id, 0));
                event(new BookmarkItemsStreamCompleted($this->bookmarkCollection->id, 0));

                return;
            }

            $bookmarkItemsQuery->whereIn('model_id', $searchIds);

            $bookmarkItems = $bookmarkItemsQuery->get()->sortBy(function ($item) use ($searchIds) {
                return array_search($item->model_id, $searchIds);
            });
        } else {
            if ($this->sortBy && $this->sortOrder) {
                $bookmarkItemsQuery->join($model_type::getModel()->getTable(), function ($join) use ($model_type) {
                    $join->on('bookmark_items.model_id', '=', $model_type::getModel()->getTable().'.id')
                        ->where('bookmark_items.model_type', '=', $model_type);
                })->orderBy($model_type::getModel()->getTable().'.'.$this->sortBy, $this->sortOrder);
            }

            $bookmarkItems = $bookmarkItemsQuery->get();
        }

        $total = $bookmarkItems->count();

        // Start streaming
        event(new BookmarkItemsStreamStarted($this->bookmarkCollection->id, $total));

        $index = 0;
        foreach ($bookmarkItems as $bookmarkItem) {
            if (! $bookmarkItem->model) {
                continue;
            }

            $proposalData = $bookmarkItem->model->toArray();

            // Add vote data if available
            if ($bookmarkItem->vote !== null) {
                $proposalData['vote'] = $bookmarkItem->vote;
            }

            // Broadcast this item
            event(new BookmarkItemStreamed(
                $this->bookmarkCollection->id,
                $proposalData,
                $index,
                $total
            ));

            $index++;

            // Small delay to prevent overwhelming
            usleep(50000); // 50ms
        }

        // Complete streaming
        event(new BookmarkItemsStreamCompleted($this->bookmarkCollection->id, $index));
    }
}
