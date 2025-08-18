<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\BookmarkCollectionData;
use App\Enums\BookmarkableType;
use App\Enums\BookmarkStatus;
use App\Enums\BookmarkVisibility;
use App\Enums\ProposalSearchParams;
use App\Enums\QueryParamsEnum;
use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Community;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Models\Review;
use App\Repositories\BookmarkCollectionRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Fluent;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Scout\Builder;

class BookmarksController extends Controller
{
    protected int $currentPage = 1;

    protected array $queryParams = [];

    protected int $perPage = 24;

    protected ?string $sortBy = 'updated_at';

    protected ?string $sortOrder = 'desc';

    protected ?string $search = null;

    protected array $filters = [];

    protected int $limit = 24;

    protected Builder $searchBuilder;

    /**
     * Display the bookmarks index page.
     */
    public function index(Request $request): Response
    {
        $this->setFilters($request);

        $props = [
            'bookmarkCollections' => $this->query(),
            'search' => $this->search,
            'sortBy' => $this->sortBy,
            'sortOrder' => $this->sortOrder,
            'sort' => "{$this->sortBy}:{$this->sortOrder}",
            'filters' => $this->filters,
            'queryParams' => $this->queryParams,
        ];

        return Inertia::render('Bookmarks/Index', $props);
    }

    public function view(BookmarkCollection $bookmarkCollection, Request $request, ?string $type = 'proposals')
    {
        $this->setFilters($request);

        $model_type = BookmarkableType::from(Str::kebab($type))->getModelClass();

        $bookmarkItemIds = $bookmarkCollection->items
            ->where('model_type', $model_type)
            ->pluck('model_id')
            ->toArray();

        $pagination = $this->queryModels($model_type, $bookmarkItemIds);
        $typesCounts = $this->getFilteredTypesCounts($bookmarkCollection);

        $props = [
            'bookmarkCollection' => array_merge(
                $bookmarkCollection->load('author')->toArray(),
                ['types_count' => $typesCounts]
            ),
            'type' => $type,
            'search' => $this->search,
            'sortBy' => $this->sortBy,
            'sortOrder' => $this->sortOrder,
            'sort' => "{$this->sortBy}:{$this->sortOrder}",
            'filters' => $this->filters,
            'queryParams' => $this->queryParams,
            $type => $pagination,
        ];

        return Inertia::render('Bookmarks/View', $props);
    }

    protected function getFilteredTypesCounts(BookmarkCollection $bookmarkCollection): array
    {
        $modelTypes = [
            'proposals' => Proposal::class,
            'ideascaleProfiles' => IdeascaleProfile::class,
            'groups' => Group::class,
            'reviews' => Review::class,
            'communities' => Community::class,
        ];

        $typesCounts = [];

        foreach ($modelTypes as $typeKey => $modelClass) {
            $bookmarkItemIds = $bookmarkCollection->items
                ->where('model_type', $modelClass)
                ->pluck('model_id')
                ->toArray();

            if (empty($bookmarkItemIds)) {
                $typesCounts[$typeKey] = 0;

                continue;
            }

            if ($this->search) {
                $searchBuilder = $modelClass::search($this->search);
                $searchBuilder->whereIn('id', $bookmarkItemIds);

                $searchResults = $searchBuilder->raw();
                $count = $searchResults['estimatedTotalHits'] ?? 0;
            } else {
                $query = $modelClass::query();
                $query->whereIn('id', $bookmarkItemIds);

                $count = $query->count();
            }

            $typesCounts[$typeKey] = $count;
        }

        return $typesCounts;
    }

    protected function queryModels(string $modelType, array $constrainToIds = []): array
    {
        if ($this->search) {
            $searchBuilder = $modelType::search($this->search);

            if (! empty($constrainToIds)) {
                $searchBuilder->whereIn('id', $constrainToIds);
            }

            if ($this->sortBy && $this->sortOrder) {
                $searchBuilder->orderBy($this->sortBy, $this->sortOrder);
            }

            $data = $searchBuilder->paginate($this->perPage, ProposalSearchParams::PAGE()->value);
        } else {
            $query = $modelType::query();

            if (! empty($constrainToIds)) {
                $query->whereIn('id', $constrainToIds);
            }

            if ($this->sortBy && $this->sortOrder) {
                $query->orderBy($this->sortBy, $this->sortOrder);
            }

            $data = $query->paginate($this->perPage, ['*'], ProposalSearchParams::PAGE()->value);
        }

        return to_length_aware_paginator(
            $modelType::toDtoPaginated($data),
        )->toArray();
    }

    public function manage(BookmarkCollection $bookmarkCollection, Request $request, ?string $type = 'proposals'): Response
    {
        if ($request->user()->id != $bookmarkCollection->id) {
            Inertia::render('Error404');
        }

        $currentPage = request(ProposalSearchParams::PAGE()->value, 1);

        $model_type = BookmarkableType::from(Str::kebab($type))->getModelClass();

        $relationshipsMap = [
            Proposal::class => ['users', 'fund', 'campaign'],
            Group::class => ['ideascale_profiles'],
            Community::class => ['ideascale_profiles'],
        ];

        $countMap = [
            Group::class => ['proposals', 'funded_proposals'],
            Community::class => ['ideascale_profiles', 'proposals'],
        ];

        $relationships = $relationshipsMap[$model_type] ?? [];
        $counts = $countMap[$model_type] ?? [];

        $data = $model_type::with($relationships)->withCount($counts)->whereIn(
            'id',
            $bookmarkCollection->items
                ->where('model_type', $model_type)
                ->pluck('model_id')
        )->paginate(12, ['*'], ProposalSearchParams::PAGE()->value);

        $pagination = to_length_aware_paginator(
            $model_type::toDtoPaginated($data),
        );

        return Inertia::render('Bookmarks/Manage', [
            'bookmarkCollection' => $bookmarkCollection->load('author'),
            'type' => $type,
            'filters' => [ProposalSearchParams::PAGE()->value => $currentPage],
            $type => $pagination,
        ]);
    }

    protected function setFilters(Request $request): void
    {
        $this->limit = (int) $request->input(QueryParamsEnum::LIMIT(), 24);
        $this->currentPage = (int) $request->input(QueryParamsEnum::PAGE(), 1);
        $this->search = $request->input(QueryParamsEnum::QUERY(), null);

        $this->queryParams = $request->validate([
            ProposalSearchParams::QUERY()->value => 'string|nullable',
            ProposalSearchParams::PAGE()->value => 'integer|nullable',
            ProposalSearchParams::LIMIT()->value => 'integer|nullable',
            ProposalSearchParams::SORTS()->value => 'string|nullable',
        ]);

        $this->filters = $this->queryParams;

        $sort = collect(explode(':', $request->input(ProposalSearchParams::SORTS()->value, '')))->filter();

        if (! $sort->isEmpty()) {
            $this->sortBy = $sort->first();
            $this->sortOrder = $sort->last();
        }
    }

    public function query($returnBuilder = false): array|Builder
    {
        $visibility = BookmarkVisibility::PUBLIC()->value;

        $args = [
            'filter' => "visibility={$visibility}",
        ];

        if ((bool) $this->sortBy && (bool) $this->sortOrder) {
            $args['sort'] = ["$this->sortBy:$this->sortOrder"];
        }

        $page = isset($this->currentPage)
            ? (int) $this->currentPage
            : 1;

        $limit = isset($this->limit)
            ? (int) $this->limit
            : 64;

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;

        $reviews = app(BookmarkCollectionRepository::class);

        $builder = $reviews->search(
            $this->search ?? '',
            $args
        );

        if ($returnBuilder) {
            return $builder;
        }

        $response = new Fluent($builder->raw());
        $items = collect($response->hits);

        $pagination = new LengthAwarePaginator(
            BookmarkCollectionData::collect($items->toArray()),
            $response->estimatedTotalHits,
            $limit,
            $page,
            [
                'pageName' => 'p',
                'onEachSide' => 0,
            ]
        );

        return $pagination->toArray();
    }

    public function handleStep(Request $request, $step): mixed
    {
        $method = "step{$step}";

        if (method_exists($this, $method)) {
            return $this->$method($request);
        }

        abort(404, "Step '{$step}' not found.");
    }

    public function step1(Request $request): Response
    {

        return Inertia::render('Workflows/CreateBookmark/Step1', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'bookmarkCollection' => $request->bookmarkCollection,
        ]);
    }

    public function step2(Request $request): Response
    {
        $collection = null;

        if ($hash = ($request->bookmarkCollection ?? $request->input('bookmarkCollectionId'))) {
            $collection = BookmarkCollection::find($hash);
        }

        return Inertia::render('Workflows/CreateBookmark/Step2', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'bookmarkCollection' => $collection,
        ]);
    }

    public function step3(Request $request): RedirectResponse|Response
    {
        if (empty($request->bookmarkCollection) && ! $request->filled('bookmarkCollectionId')) {
            return to_route('workflows.bookmarks.index', [
                'step' => 2,
            ]);
        }

        $collection = BookmarkCollection::find($request->bookmarkCollection ?? $request->input('bookmarkCollectionId'));

        $modelMap = [
            \App\Models\Proposal::class => 'proposals',
            \App\Models\Review::class => 'reviews',
            \App\Models\Group::class => 'groups',
            \App\Models\Community::class => 'communities',
            \App\Models\IdeascaleProfile::class => 'ideascaleProfiles',
        ];

        $selectedItemsByType = $collection->items
            ->groupBy('model_type')
            ->mapWithKeys(function ($items, $modelType) use ($modelMap) {
                $label = $modelMap[$modelType] ?? null;

                if (! $label) {
                    return [];
                }

                $modelIds = $items->pluck('model_id')->all();

                return [$label => $modelIds];
            });

        return Inertia::render('Workflows/CreateBookmark/Step3', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'bookmarkCollection' => $collection,
            'collectionItems' => $selectedItemsByType,
        ]);
    }

    public function step4(Request $request): RedirectResponse|Response
    {
        if (empty($request->bookmarkCollection) && ! $request->filled('bookmarkCollectionId')) {
            return to_route('workflows.bookmarks.index', [
                'step' => 2,
            ]);
        }

        $collection = BookmarkCollection::find($request->bookmarkCollection ?? $request->input('bookmarkCollectionId'));

        return Inertia::render('Workflows/CreateBookmark/Step4', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'rationale' => $collection->meta_info?->rationale,
            'bookmarkCollection' => $collection->id,
            'bookmarkCollectionId' => $collection->id,
        ]);
    }

    public function success(Request $request): Response
    {
        return Inertia::render('Workflows/CreateBookmark/Success', [
            'stepDetails' => [],
        ]);
    }

    public function saveList(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'visibility' => 'required|string',
            'content' => 'nullable|string|',
            'comments_enabled' => 'nullable|boolean',
            'color' => 'nullable|string|max:7',
            'status' => 'nullable|string',
            'bookmarkCollection' => 'nullable|string',
        ]);

        $existingList = BookmarkCollection::find($request->bookmarkCollection);

        if ($existingList) {
            $existingList->update([
                'user_id' => $request->user()->id,
                'title' => $validated['title'],
                'content' => $validated['content'] ?? null,
                'color' => $validated['color'] ?? '#2596BE',
                'allow_comments' => $validated['comments_enabled'] ?? false,
                'visibility' => $validated['visibility'],
                'status' => $validated['status'] ?? BookmarkStatus::DRAFT()->value,
            ]);
            $bookmarkCollection = $existingList;
        } else {
            $bookmarkCollection = BookmarkCollection::create([
                'user_id' => $request->user()->id,
                'title' => $validated['title'],
                'content' => $validated['content'] ?? null,
                'color' => $validated['color'] ?? '#2596BE',
                'allow_comments' => $validated['comments_enabled'] ?? false,
                'visibility' => $validated['visibility'],
                'status' => $validated['status'] ?? BookmarkStatus::DRAFT()->value,
            ]);
        }
        $bookmarkCollection->searchable();

        return to_route('workflows.bookmarks.index', [
            'step' => 3,
            'bookmarkCollection' => $bookmarkCollection->id,
            'bookmarkCollectionId' => $bookmarkCollection->id,
        ]);
    }

    public function addBookmarkItem(BookmarkCollection $bookmarkCollection, Request $request)
    {
        $validated = $request->validate([
            'modelType' => ['required', 'string'],
            'hash' => ['required', 'string'],
        ]);

        $bookmarkableType = BookmarkableType::tryFrom(Str::kebab($validated['modelType']))->getModelClass();

        $model = $bookmarkableType::find($validated['hash']);

        if (empty($model)) {
            return back()->withErrors(['message' => "Item {$validated['modelType']} if hash {$validated['hash']} not found."]);
        }

        BookmarkItem::updateOrCreate([
            'user_id' => Auth::id(),
            'bookmark_collection_id' => $bookmarkCollection->id,
            'model_id' => $model->id,
            'model_type' => $bookmarkableType,
        ], [
            'title' => null,
            'content' => null,
            'action' => null,
        ]);

        $bookmarkCollection->searchable();

        return back()->with('success', 'Bookmark added!.');
    }

    public function removeBookmarkItem(BookmarkCollection $bookmarkCollection, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'modelType' => ['required', 'string'],
            'hash' => ['required', 'string'],
        ]);

        $bookmarkableType = BookmarkableType::tryFrom(Str::kebab($validated['modelType']))->getModelClass();

        $model = $bookmarkableType::find($validated['hash']);

        if (empty($model)) {
            return back()->withErrors([
                'message' => "Item {$validated['modelType']} with hash {$validated['hash']} not found.",
            ]);
        }

        $bookmark = BookmarkItem::where('user_id', Auth::id())
            ->where('bookmark_collection_id', $bookmarkCollection->id)
            ->where('model_id', $model->id)
            ->where('model_type', $bookmarkableType)
            ->first();

        if (! $bookmark) {
            return back()->withErrors([
                'message' => 'Bookmark does not exist.',
            ]);
        }

        $bookmark->delete();

        $bookmarkCollection->searchable();

        return back()->with('success', 'Bookmark removed.');
    }

    public function saveRationales(BookmarkCollection $bookmarkCollection, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rationale' => 'required|string|min:69',
        ]);

        $bookmarkCollection->saveMeta('rationale', $validated['rationale']);

        if ($bookmarkCollection && $bookmarkCollection->status === BookmarkStatus::DRAFT()->value) {
            $bookmarkCollection->update(['status' => BookmarkStatus::PUBLISHED()->value]);
        }

        $bookmarkCollection->searchable();

        return to_route('workflows.bookmarks.success');
    }

    public function getStepDetails(): Collection
    {
        return collect([
            [
                'title' => 'workflows.bookmarks.details',
            ],
            [
                'title' => 'workflows.bookmarks.listDetail',
                'info' => 'workflows.bookmarks.listDetailInfo',
            ],
            [
                'title' => 'workflows.bookmarks.listItems',
                'info' => 'workflows.bookmarks.listItemsInfo',
            ],
            [
                'title' => 'workflows.bookmarks.rationale',
                'info' => 'workflows.bookmarks.rationaleInfo',
            ],
        ]);
    }
}
