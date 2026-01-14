<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\BookmarkCollectionData;
use App\DataTransferObjects\UserData;
use App\Enums\BookmarkableType;
use App\Enums\BookmarkStatus;
use App\Enums\BookmarkVisibility;
use App\Enums\ProposalSearchParams;
use App\Enums\QueryParamsEnum;
use App\Mail\BookmarkCollectionInvitation;
use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Comment;
use App\Models\Community;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Models\Review;
use App\Models\Scopes\PublicVisibilityScope;
use App\Models\User;
use App\Repositories\BookmarkCollectionRepository;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Fluent;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Scout\Builder;
use Spatie\Browsershot\Browsershot;
use Spatie\LaravelPdf\Facades\Pdf;

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

    public function view(string $bookmarkCollection, Request $request, ?string $type = 'proposals')
    {
        $bookmarkCollectionModel = BookmarkCollection::withoutGlobalScope(PublicVisibilityScope::class)
            ->find($bookmarkCollection);

        if (! $bookmarkCollectionModel) {
            abort(404);
        }

        if ($bookmarkCollectionModel->visibility === 'public') {
            // Public collections are accessible to everyone
        } elseif (Auth::check()) {
            try {
                Gate::authorize('view', $bookmarkCollectionModel);
            } catch (AuthorizationException $e) {
                abort(404);
            }
        } else {
            abort(404);
        }

        $this->setFilters($request);

        $isVoterList = $bookmarkCollectionModel->list_type === 'voter';

        // For voter lists with proposals, provide empty pagination since frontend will stream
        if ($isVoterList && $type === 'proposals') {
            $pagination = [
                'current_page' => 1,
                'data' => [],
                'first_page_url' => null,
                'from' => null,
                'last_page' => 1,
                'last_page_url' => null,
                'next_page_url' => null,
                'path' => null,
                'per_page' => $this->perPage,
                'prev_page_url' => null,
                'to' => null,
                'total' => $bookmarkCollectionModel->items()->where('model_type', 'App\\Models\\Proposal')->count(),
            ];
        } else {
            // For non-voter lists or non-proposal types, load items normally
            $model_type = BookmarkableType::from(Str::kebab($type))->getModelClass();

            $relationshipsMap = [
                Proposal::class => ['users', 'fund', 'campaign', 'schedule'],
                Group::class => ['ideascale_profiles'],
                Community::class => ['ideascale_profiles'],
            ];

            $countMap = [
                Group::class => ['proposals', 'funded_proposals'],
                Community::class => ['ideascale_profiles', 'proposals'],
            ];

            $relationships = $relationshipsMap[$model_type] ?? [];
            $counts = $countMap[$model_type] ?? [];

            $bookmarkItemIds = $bookmarkCollectionModel->items
                ->where('model_type', $model_type)
                ->pluck('model_id')
                ->toArray();

            $pagination = $this->queryModels($model_type, $bookmarkItemIds, $relationships, $counts);
        }

        $typesCounts = $this->getFilteredTypesCounts($bookmarkCollectionModel, $isVoterList);

        $bookmarkCollectionModel->load(['author', 'collaborators']);
        $pendingInvitations = $this->getPendingInvitations($bookmarkCollectionModel);

        $props = [
            'bookmarkCollection' => array_merge(
                $bookmarkCollectionModel->toArray(),
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
            'pendingInvitations' => array_values($pendingInvitations),
        ];

        return Inertia::render('Bookmarks/View', $props);
    }

    protected function getFilteredTypesCounts(BookmarkCollection $bookmarkCollection, bool $isVoterList = false): array
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
            // For voter lists, get counts directly from database without loading all items
            if ($isVoterList) {
                Log::info('OPTIMIZATION: Using direct DB query for count', [
                    'type_key' => $typeKey,
                    'model_class' => $modelClass,
                ]);
                $baseQuery = $bookmarkCollection->items()
                    ->where('model_type', $modelClass);

                if ($this->search) {
                    $searchBuilder = $modelClass::search($this->search);
                    $searchResults = $searchBuilder->raw();
                    $searchIds = collect($searchResults['hits'] ?? [])->pluck('id')->toArray();

                    if (empty($searchIds)) {
                        $count = 0;
                    } else {
                        $count = $baseQuery->whereIn('model_id', $searchIds)->count();
                    }
                } else {
                    $count = $baseQuery->count();
                }
            } else {
                // For non-voter lists, use the existing logic with loaded items
                $bookmarkItemIds = $bookmarkCollection->items
                    ->where('model_type', $modelClass)
                    ->pluck('model_id')
                    ->toArray();

                if (empty($bookmarkItemIds)) {
                    $count = 0;
                } elseif ($this->search) {
                    $searchBuilder = $modelClass::search($this->search);
                    $searchBuilder->whereIn('id', $bookmarkItemIds);

                    $searchResults = $searchBuilder->raw();
                    $count = $searchResults['estimatedTotalHits'] ?? 0;
                } else {
                    $query = $modelClass::query();
                    $query->whereIn('id', $bookmarkItemIds);

                    $count = $query->count();
                }
            }

            $typesCounts[$typeKey] = $count;
        }

        return $typesCounts;
    }

    protected function queryModels(string $modelType, array $constrainToIds = [], array $relationships = [], array $counts = []): array
    {
        // If no specific IDs are provided, return empty result to avoid querying all records
        if (empty($constrainToIds)) {
            $pagination = new LengthAwarePaginator(
                [],
                0,
                $this->perPage,
                $this->currentPage,
                [
                    'pageName' => ProposalSearchParams::PAGE()->value,
                    'path' => request()->url(),
                    'query' => request()->query(),
                ]
            );

            return $pagination->toArray();
        }

        if ($this->search) {
            $searchBuilder = $modelType::search($this->search);

            $searchBuilder->whereIn('id', $constrainToIds);

            if ($this->sortBy && $this->sortOrder) {
                $searchBuilder->orderBy($this->sortBy, $this->sortOrder);
            }

            $data = $searchBuilder->paginate($this->perPage, ProposalSearchParams::PAGE()->value);
        } else {
            $query = $modelType::query();

            // Remove global scopes for bookmark collections to ensure all bookmarked items are returned
            if ($modelType === Proposal::class) {
                $query->withoutGlobalScopes();
            }

            if (! empty($relationships)) {
                $query->with($relationships);
            }

            if (! empty($counts)) {
                $query->withCount($counts);
            }

            $query->whereIn('id', $constrainToIds);

            if ($this->sortBy && $this->sortOrder) {
                $query->orderBy($this->sortBy, $this->sortOrder);
            }

            $data = $query->paginate($this->perPage, ['*'], ProposalSearchParams::PAGE()->value);
        }

        return to_length_aware_paginator(
            $modelType::toDtoPaginated($data),
        )->toArray();
    }

    protected function queryModelsUnpaginated(string $modelType, array $constrainToIds = [], array $relationships = [], array $counts = []): array
    {
        // If no specific IDs are provided, return empty result to avoid querying all records
        if (empty($constrainToIds)) {
            $pagination = new LengthAwarePaginator(
                [],
                0,
                $this->perPage,
                $this->currentPage,
                [
                    'pageName' => ProposalSearchParams::PAGE()->value,
                    'path' => request()->url(),
                    'query' => request()->query(),
                ]
            );

            return $pagination->toArray();
        }

        if ($this->search) {
            $searchBuilder = $modelType::search($this->search);

            if (! empty($constrainToIds)) {
                $searchBuilder->whereIn('id', $constrainToIds);
            }

            if ($this->sortBy && $this->sortOrder) {
                $searchBuilder->orderBy($this->sortBy, $this->sortOrder);
            }

            // Get all results for search
            $allResults = $searchBuilder->get();
            $total = $searchBuilder->raw()['estimatedTotalHits'] ?? $allResults->count();

        } else {
            $query = $modelType::query();

            if (! empty($relationships)) {
                $query->with($relationships);
            }

            if (! empty($counts)) {
                $query->withCount($counts);
            }

            if (! empty($constrainToIds)) {
                $query->whereIn('id', $constrainToIds);
            }

            if ($this->sortBy && $this->sortOrder) {
                $query->orderBy($this->sortBy, $this->sortOrder);
            }

            // Get all results without pagination
            $allResults = $query->get();
            $total = $allResults->count();

        }
        $data = $modelType::toDtoCollection($allResults);

        $pagination = new LengthAwarePaginator(
            $data,
            $total,
            $this->perPage,
            $this->currentPage,
            [
                'pageName' => ProposalSearchParams::PAGE()->value,
                'path' => request()->url(),
                'query' => request()->query(),
            ]
        );

        return $pagination->toArray();
    }

    public function manage(string $bookmarkCollectionId, Request $request, ?string $type = 'proposals'): Response
    {
        // Find collection bypassing global scopes to access private collections
        $bookmarkCollection = BookmarkCollection::withoutGlobalScope(PublicVisibilityScope::class)
            ->find($bookmarkCollectionId);

        if (! $bookmarkCollection) {
            abort(404);
        }

        Gate::authorize('update', $bookmarkCollection);

        $this->setFilters($request);

        $currentPage = request(ProposalSearchParams::PAGE()->value, 1);

        $isVoterList = $bookmarkCollection->list_type === 'voter';

        if ($isVoterList) {
            $bookmarkCollection->load(['author', 'collaborators']);
            $pendingInvitations = $this->getPendingInvitations($bookmarkCollection);

            $emptyPagination = [
                'data' => [],
            ];

            return Inertia::render('Bookmarks/Manage', [
                'bookmarkCollection' => $bookmarkCollection,
                'type' => $type,
                'filters' => array_merge([ProposalSearchParams::PAGE()->value => $currentPage]),
                $type => $emptyPagination,
                'owner' => UserData::from($bookmarkCollection->author),
                'pendingInvitations' => array_values($pendingInvitations),
            ]);
        }

        $model_type = BookmarkableType::from(Str::kebab($type))->getModelClass();

        $relationshipsMap = [
            Proposal::class => ['users', 'fund', 'campaign', 'schedule'],
            Group::class => ['ideascale_profiles'],
            Community::class => ['ideascale_profiles'],
        ];

        $countMap = [
            Group::class => ['proposals', 'funded_proposals'],
            Community::class => ['ideascale_profiles', 'proposals'],
        ];

        $relationships = array_merge($relationshipsMap[$model_type] ?? [], []);
        $counts = $countMap[$model_type] ?? [];

        $bookmarkItemIds = $bookmarkCollection->items
            ->where('model_type', $model_type)
            ->pluck('model_id')
            ->toArray();

        $pagination = $this->queryModels($model_type, $bookmarkItemIds, $relationships, $counts);

        $bookmarkCollection->load(['author', 'collaborators']);

        // Get pending invitations
        $pendingInvitations = $this->getPendingInvitations($bookmarkCollection);

        return Inertia::render('Bookmarks/Manage', [
            'bookmarkCollection' => $bookmarkCollection,
            'type' => $type,
            'filters' => array_merge([ProposalSearchParams::PAGE()->value => $currentPage]),
            $type => $pagination,
            'owner' => UserData::from($bookmarkCollection->author),
            'pendingInvitations' => array_values($pendingInvitations), // Convert to indexed array for frontend
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

        $lists = app(BookmarkCollectionRepository::class);

        $builder = $lists->search(
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
            Proposal::class => 'proposals',
            Review::class => 'reviews',
            Group::class => 'groups',
            Community::class => 'communities',
            IdeascaleProfile::class => 'ideascaleProfiles',
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
        $collection->load(['author', 'collaborators']);

        // Get pending invitations
        $pendingInvitations = $this->getPendingInvitations($collection);

        return Inertia::render('Workflows/CreateBookmark/Step4', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'bookmarkCollection' => $collection,
            'bookmarkCollectionId' => $collection->id,
            'contributors' => UserData::collect($collection->collaborators),
            'owner' => UserData::from($collection->author),
            'pendingInvitations' => array_values($pendingInvitations), // Convert to indexed array for frontend
        ]);
    }

    public function step5(Request $request): RedirectResponse|Response
    {
        if (empty($request->bookmarkCollection) && ! $request->filled('bookmarkCollectionId')) {
            return to_route('workflows.bookmarks.index', [
                'step' => 2,
            ]);
        }

        $collection = BookmarkCollection::find($request->bookmarkCollection ?? $request->input('bookmarkCollectionId'));

        $rationale = $collection->comments()
            ->where('commentator_id', $collection->user_id)
            ->whereJsonContains('extra->type', 'rationale')
            ->latest()
            ->first()?->original_text;

        return Inertia::render('Workflows/CreateBookmark/Step5', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'rationale' => $rationale,
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
            'step' => 4,
            'bookmarkCollection' => $bookmarkCollection->id,
            'bookmarkCollectionId' => $bookmarkCollection->id,
        ]);
    }

    public function addBookmarkItem(BookmarkCollection $bookmarkCollection, Request $request)
    {
        Gate::authorize('addItems', $bookmarkCollection);

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
        Gate::authorize('removeItems', $bookmarkCollection);

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

        Comment::create([
            'commentable_type' => BookmarkCollection::class,
            'commentable_id' => $bookmarkCollection->id,
            'text' => $validated['rationale'],
            'original_text' => $validated['rationale'],
            'commentator_id' => auth()->user()?->id,
            'extra' => ['type' => 'rationale'], // Mark this as a rationale comment
        ]);

        if ($bookmarkCollection && $bookmarkCollection->status === BookmarkStatus::DRAFT()->value) {
            $bookmarkCollection->update(['status' => BookmarkStatus::PUBLISHED()->value]);
        }

        $bookmarkCollection->searchable();

        return to_route('workflows.bookmarks.success');
    }

    public function inviteContributor(BookmarkCollection $bookmarkCollection, Request $request): RedirectResponse
    {
        Gate::authorize('update', $bookmarkCollection);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $invitedUser = User::findOrFail($validated['user_id']);
        $inviter = Auth::user();

        // Check if user is already a contributor
        if ($bookmarkCollection->contributors()->where('user_id', $validated['user_id'])->exists()) {
            return back()->withErrors(['message' => 'User is already a contributor to this collection.']);
        }

        // Get existing invitations from metas
        $existingInvitations = $this->getPendingInvitations($bookmarkCollection);

        // Check if user already has a pending invitation
        if (isset($existingInvitations[$validated['user_id']])) {
            return back()->withErrors(['message' => 'User already has a pending invitation to this collection.']);
        }

        // Generate invitation token
        $token = Str::random(60);

        // Add invitation to existing invitations
        $existingInvitations[$validated['user_id']] = [
            'user_id' => $validated['user_id'],
            'user_email' => $invitedUser->email,
            'user_name' => $invitedUser->name,
            'inviter_id' => $inviter->id,
            'inviter_name' => $inviter->name,
            'token' => $token,
            'invited_at' => now()->toISOString(),
            'status' => 'pending',
        ];

        // Store invitations in metas table
        $bookmarkCollection->saveMeta('invitations', json_encode($existingInvitations));

        // Send invitation email
        try {

            // Use raw email attributes to bypass potential policy issues
            $invitedUserEmail = $invitedUser->getAttributes()['email'] ?? $invitedUser->email;

            Mail::to($invitedUserEmail, $invitedUser->name)->send(
                new BookmarkCollectionInvitation($inviter, $invitedUser, $bookmarkCollection, $token)
            );

            return back()->with('success', 'Invitation sent successfully to '.$invitedUser->name.'.');
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Failed to send bookmark invitation email: '.$e->getMessage(), [
                'inviter_id' => $inviter->id,
                'invited_user_id' => $invitedUser->id,
                'invited_user_email' => $invitedUser->email,
                'collection_id' => $bookmarkCollection->id,
            ]);

            // Remove the invitation from metas if email failed
            unset($existingInvitations[$validated['user_id']]);
            $bookmarkCollection->saveMeta('invitations', json_encode($existingInvitations));

            return back()->withErrors(['message' => 'Failed to send invitation email. Please try again.']);
        }
    }

    public function removeContributor(BookmarkCollection $bookmarkCollection, Request $request): RedirectResponse
    {
        Gate::authorize('update', $bookmarkCollection);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $bookmarkCollection->contributors()->detach($validated['user_id']);

        return back()->with('success', 'Contributor removed successfully.');
    }

    public function searchUsers(Request $request)
    {
        $validated = $request->validate([
            'query' => 'required|string|min:2',
        ]);

        $users = User::where('name', 'ILIKE', '%'.$validated['query'].'%')
            ->orWhere('email', 'ILIKE', '%'.$validated['query'].'%')
            ->limit(10)
            ->with('media')
            ->get();

        return UserData::collect($users);
    }

    /**
     * Get pending invitations for a bookmark collection
     */
    protected function getPendingInvitations(BookmarkCollection $bookmarkCollection): array
    {
        $invitationsMeta = $bookmarkCollection->metas()->where('key', 'invitations')->first();

        if (! $invitationsMeta || empty($invitationsMeta->content)) {
            return [];
        }

        try {
            return json_decode($invitationsMeta->content, true) ?? [];
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Accept a bookmark collection invitation
     */
    public function acceptInvitation(Request $request): RedirectResponse
    {
        $token = $request->query('token');
        $collectionId = $request->query('collection');

        if (! $token || ! $collectionId) {
            abort(404);
        }

        $bookmarkCollection = BookmarkCollection::withoutGlobalScope(PublicVisibilityScope::class)
            ->find($collectionId);

        if (! $bookmarkCollection) {
            abort(404);
        }
        $invitations = $this->getPendingInvitations($bookmarkCollection);

        // Find invitation by token
        $invitation = null;
        $userId = null;
        foreach ($invitations as $uid => $inv) {
            if ($inv['token'] === $token && $inv['status'] === 'pending') {
                $invitation = $inv;
                $userId = $uid;
                break;
            }
        }

        if (! $invitation) {
            return redirect()->route('lists.index')
                ->withErrors(['message' => 'Invalid or expired invitation.']);
        }

        // Check if user is authenticated and matches invitation
        $currentUser = Auth::user();

        if (! $currentUser) {
            // User not authenticated - redirect to login
            session(['invitation_token' => $token, 'invitation_collection' => $collectionId]);

            return redirect()->route('login')
                ->with('message', 'Please log in to accept the invitation.');
        }

        if ($currentUser->id !== $userId) {
            // User mismatch - show error with better explanation
            $invitedUser = User::find($userId);
            $invitedUserEmail = $invitedUser ? $invitedUser->getAttributes()['email'] : 'Unknown';

            return redirect()->route('lists.index')
                ->withErrors([
                    'message' => "This invitation was sent to {$invitedUserEmail}. Please log in as that user to accept the invitation, or contact the person who invited you.",
                ]);
        }

        // Check if user is already a contributor
        if ($bookmarkCollection->contributors()->where('user_id', $userId)->exists()) {
            // Mark invitation as accepted and remove it
            unset($invitations[$userId]);
            $bookmarkCollection->saveMeta('invitations', json_encode($invitations));

            return redirect()->route('my.lists.manage', ['bookmarkCollection' => $bookmarkCollection->id])
                ->with('success', 'You are already a contributor to this collection.');
        }

        // Add user as contributor
        $bookmarkCollection->contributors()->attach($userId);

        // Mark invitation as accepted and remove it
        unset($invitations[$userId]);
        $bookmarkCollection->saveMeta('invitations', json_encode($invitations));

        // Store collection ID in session for success page
        session(['invitation_accepted_collection' => $bookmarkCollection->id]);

        return redirect()->route('workflows.acceptInvitation.success')
            ->with('success', 'You have successfully joined the "'.$bookmarkCollection->title.'" collection!');
    }

    /**
     * Show invitation acceptance success page
     */
    public function acceptInvitationSuccess(): Response
    {
        $collectionId = session('invitation_accepted_collection');

        if (! $collectionId) {
            return redirect()->route('lists.index')
                ->withErrors(['message' => 'No invitation acceptance found.']);
        }

        $bookmarkCollection = BookmarkCollection::withoutGlobalScope(PublicVisibilityScope::class)
            ->find($collectionId);

        if (! $bookmarkCollection) {
            return redirect()->route('lists.index')
                ->withErrors(['message' => 'Bookmark collection not found.']);
        }

        // Clear the session
        session()->forget('invitation_accepted_collection');

        return Inertia::render('Workflows/AcceptInvitation/Success', [
            'bookmarkCollection' => BookmarkCollectionData::from($bookmarkCollection),
        ]);
    }

    /**
     * Cancel a pending invitation
     */
    public function cancelInvitation(BookmarkCollection $bookmarkCollection, Request $request): RedirectResponse
    {
        Gate::authorize('update', $bookmarkCollection);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $invitations = $this->getPendingInvitations($bookmarkCollection);

        if (isset($invitations[$validated['user_id']])) {
            $userName = $invitations[$validated['user_id']]['user_name'] ?? 'User';
            unset($invitations[$validated['user_id']]);
            $bookmarkCollection->saveMeta('invitations', json_encode($invitations));

            return back()->with('success', 'Invitation to '.$userName.' has been cancelled.');
        }

        return back()->withErrors(['message' => 'No pending invitation found for this user.']);
    }

    /**
     * Resend an invitation
     */
    public function resendInvitation(BookmarkCollection $bookmarkCollection, Request $request): RedirectResponse
    {
        Gate::authorize('update', $bookmarkCollection);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $invitations = $this->getPendingInvitations($bookmarkCollection);

        if (! isset($invitations[$validated['user_id']])) {
            return back()->withErrors(['message' => 'No pending invitation found for this user.']);
        }

        $invitation = $invitations[$validated['user_id']];
        $invitedUser = User::findOrFail($validated['user_id']);
        $inviter = Auth::user();

        try {
            $invitedUserEmail = $invitedUser->getAttributes()['email'] ?? $invitedUser->email;

            Mail::to($invitedUserEmail, $invitedUser->name)->send(
                new BookmarkCollectionInvitation($inviter, $invitedUser, $bookmarkCollection, $invitation['token'])
            );

            $invitations[$validated['user_id']]['resent_at'] = now()->toISOString();
            $bookmarkCollection->saveMeta('invitations', json_encode($invitations));

            return back()->with('success', 'Invitation resent successfully to '.$invitedUser->name.'.');
        } catch (\Exception $e) {
            Log::error('Failed to resend bookmark invitation email: '.$e->getMessage(), [
                'inviter_id' => $inviter->id,
                'invited_user_id' => $invitedUser->id,
                'invited_user_email' => $invitedUser->email,
                'collection_id' => $bookmarkCollection->id,
            ]);

            return back()->withErrors(['message' => 'Failed to resend invitation email. Please try again.']);
        }
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
                'title' => 'workflows.bookmarks.contributors',
                'info' => 'workflows.bookmarks.contributorsInfo',
            ],
            [
                'title' => 'workflows.bookmarks.rationale',
                'info' => 'workflows.bookmarks.rationaleInfo',
            ],
        ]);
    }

    /**
     * Calculate optimal column configuration based on available space
     */
    protected function calculateColumnConfiguration(array $columns, string $orientation, string $paperSize): array
    {
        $availableWidths = [
            'A4' => [
                'portrait' => 520,
                'landscape' => 750,
            ],
            'A3' => [
                'portrait' => 750,
                'landscape' => 1050,
            ],
        ];

        $totalWidth = $availableWidths[$paperSize][$orientation];
        $columnCount = count($columns);

        $columnPriorities = [
            'title' => ['priority' => 1, 'minWidth' => 200, 'flex' => 3],
            'budget' => ['priority' => 2, 'minWidth' => 80, 'flex' => 1],
            'category' => ['priority' => 3, 'minWidth' => 100, 'flex' => 2],
            'teams' => ['priority' => 4, 'minWidth' => 180, 'flex' => 2],
            'users' => ['priority' => 4, 'minWidth' => 180, 'flex' => 2],
            'fund' => ['priority' => 5, 'minWidth' => 80, 'flex' => 1],
            'status' => ['priority' => 6, 'minWidth' => 80, 'flex' => 1],
            'funding_status' => ['priority' => 6, 'minWidth' => 80, 'flex' => 1],
            'yes_votes_count' => ['priority' => 7, 'minWidth' => 70, 'flex' => 1],
            'yesVotes' => ['priority' => 7, 'minWidth' => 70, 'flex' => 1],
            'abstain_votes_count' => ['priority' => 8, 'minWidth' => 70, 'flex' => 1],
            'abstainVotes' => ['priority' => 8, 'minWidth' => 70, 'flex' => 1],
            'no_votes_count' => ['priority' => 9, 'minWidth' => 70, 'flex' => 1],
            'my_vote' => ['priority' => 11, 'minWidth' => 80, 'flex' => 1],
            'openSourced' => ['priority' => 10, 'minWidth' => 60, 'flex' => 1],
            'opensource' => ['priority' => 10, 'minWidth' => 60, 'flex' => 1],
        ];

        $config = [];
        $totalFlex = 0;
        $totalMinWidth = 0;

        foreach ($columns as $column) {
            $columnInfo = $columnPriorities[$column] ?? ['priority' => 999, 'minWidth' => 80, 'flex' => 1];
            $totalFlex += $columnInfo['flex'];
            $totalMinWidth += $columnInfo['minWidth'];

            $config[$column] = $columnInfo;
        }

        if ($totalMinWidth > $totalWidth) {
            $uniformWidth = floor($totalWidth / $columnCount);
            foreach ($columns as $column) {
                $config[$column]['width'] = $uniformWidth;
                $config[$column]['fontSize'] = $columnCount > 10 ? '10px' : ($columnCount > 7 ? '11px' : '12px');
                $config[$column]['truncate'] = $uniformWidth < 100;
            }
        } else {
            $remainingWidth = $totalWidth - $totalMinWidth;

            foreach ($columns as $column) {
                $flexRatio = $config[$column]['flex'] / $totalFlex;
                $additionalWidth = floor($remainingWidth * $flexRatio);
                $config[$column]['width'] = $config[$column]['minWidth'] + $additionalWidth;
                $config[$column]['fontSize'] = $columnCount > 8 ? '11px' : '12px';
                $config[$column]['truncate'] = false;
            }
        }

        return $config;
    }

    /**
     * Parse PDF configuration options from request
     */
    protected function parsePdfOptions(Request $request): array
    {
        $options = [
            'orientation' => 'auto',
            'paperSize' => 'auto',
            'fontSize' => 'auto',
            'maxColumnsPerPage' => null,
        ];

        $orientation = $request->input('pdf_orientation');
        if (in_array($orientation, ['portrait', 'landscape', 'auto'])) {
            $options['orientation'] = $orientation;
        }

        $paperSize = $request->input('pdf_paper_size');
        if (in_array($paperSize, ['A4', 'A3', 'Letter', 'auto'])) {
            $options['paperSize'] = $paperSize;
        }

        $fontSize = $request->input('pdf_font_size');
        if (in_array($fontSize, ['small', 'medium', 'large', 'auto'])) {
            $options['fontSize'] = $fontSize;
        }

        $maxColumns = $request->input('pdf_max_columns_per_page');
        if (is_numeric($maxColumns) && $maxColumns > 0) {
            $options['maxColumnsPerPage'] = (int) $maxColumns;
        }

        return $options;
    }

    protected function prepareDownloadData(BookmarkCollection $bookmarkCollection, Request $request, string $type, array $defaultColumns): array
    {
        $locale = $request->segment(1) ?? app()->getLocale();

        $availableLocales = ['en', 'es', 'fr', 'de', 'pt', 'am', 'ar', 'ja', 'ko', 'sw', 'zh'];
        if (in_array($locale, $availableLocales)) {
            app()->setLocale($locale);
            config(['app.locale' => $locale]);
        }

        $this->setFilters($request);

        $model_type = BookmarkableType::from(Str::kebab($type))->getModelClass();

        $relationshipsMap = [
            Proposal::class => ['users', 'fund', 'campaign', 'schedule'],
            Group::class => ['ideascale_profiles'],
            Community::class => ['ideascale_profiles'],
        ];

        $countMap = [
            Group::class => ['proposals', 'funded_proposals'],
            Community::class => ['ideascale_profiles', 'proposals'],
        ];

        $relationships = $relationshipsMap[$model_type] ?? [];
        $counts = $countMap[$model_type] ?? [];

        $bookmarkItemIds = $bookmarkCollection->items
            ->where('model_type', $model_type)
            ->pluck('model_id')
            ->toArray();

        $proposalData = $this->getProposalsWithFullUserData($model_type, $bookmarkItemIds, $relationships, $counts, $bookmarkCollection);

        $requestedColumns = $request->input('columns');
        $userColumns = $defaultColumns;

        if ($requestedColumns) {
            if (is_string($requestedColumns)) {
                $decodedColumns = json_decode($requestedColumns, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decodedColumns)) {
                    $userColumns = $decodedColumns;
                } else {
                    $userColumns = array_filter(array_map('trim', explode(',', $requestedColumns)));
                }
            } elseif (is_array($requestedColumns)) {
                $userColumns = $requestedColumns;
            }
        }

        $columnsToUse = ! empty($userColumns) ? $userColumns : $defaultColumns;

        $catalystHeaderLogo = base64_encode(file_get_contents(public_path('img/catalyst-logo-dark-CZiPVQ7x.png')));
        $catalystFooterLogo = base64_encode(file_get_contents(public_path('img/catalyst-explorer-icon.png')));

        return [
            'proposalData' => $proposalData,
            'columnsToUse' => $columnsToUse,
            'catalystHeaderLogo' => $catalystHeaderLogo,
            'catalystFooterLogo' => $catalystFooterLogo,
            'type' => $type,
            'itemCount' => count($proposalData),
        ];
    }

    public function downloadPdf(string $bookmarkCollectionId, Request $request, ?string $type = 'proposals')
    {
        // Find collection bypassing global scopes to access private collections
        $bookmarkCollection = BookmarkCollection::withoutGlobalScope(PublicVisibilityScope::class)
            ->find($bookmarkCollectionId);

        if (! $bookmarkCollection) {
            abort(404);
        }

        // Check access permissions based on visibility and authentication
        if ($bookmarkCollection->visibility === 'public') {
            // Public collections are accessible to everyone - no additional checks needed
        } elseif (Auth::check()) {
            // Private/unlisted collections require authentication and authorization
            try {
                Gate::authorize('view', $bookmarkCollection);
            } catch (AuthorizationException $e) {
                // If authorization fails, return 404 to avoid leaking information
                abort(404);
            }
        } else {
            // Private/unlisted collection accessed by guest user - return 404
            abort(404);
        }

        $defaultPdfColumns = ['title', 'budget', 'category', 'openSourced', 'teams', 'my_vote'];
        $data = $this->prepareDownloadData($bookmarkCollection, $request, $type, $defaultPdfColumns);
        $data = $this->prepareDownloadData($bookmarkCollection, $request, $type, $defaultPdfColumns);

        $pdfOptions = $this->parsePdfOptions($request);

        $columnCount = count($data['columnsToUse']);
        $orientation = $pdfOptions['orientation'] ?? 'auto';
        $paperSize = $pdfOptions['paperSize'] ?? 'auto';

        if ($orientation === 'auto') {
            $orientation = $columnCount > 5 ? 'landscape' : 'portrait';
        }

        if ($paperSize === 'auto') {
            $paperSize = $columnCount > 8 ? 'A3' : 'A4';
        }

        $columnConfig = $this->calculateColumnConfiguration($data['columnsToUse'], $orientation, $paperSize);

        $filename = Str::slug($bookmarkCollection->title ?? 'bookmark-collection').'-'.now()->format('Y-m-d').'.pdf';

        return Pdf::view('pdf.bookmark-collection', [
            'bookmarkCollection' => $bookmarkCollection->load('author'),
            'proposals' => $data['proposalData'],
            'type' => $data['type'],
            'itemCount' => $data['itemCount'],
            'columns' => $data['columnsToUse'],
            'columnConfig' => $columnConfig,
            'orientation' => $orientation,
            'exportFormat' => 'pdf',
            'catalystHeaderLogo' => $data['catalystHeaderLogo'],
            'catalystFooterLogo' => $data['catalystFooterLogo'],
        ])
            ->format($paperSize)
            ->orientation($orientation)
            ->margins(30, 30, 40, 30)
            ->withBrowsershot(function ($browsershot) {
                $browsershot
                    ->setChromePath('/usr/bin/chromium')
                    ->timeout(120)
                    ->addChromiumArguments([
                        'no-sandbox',
                        'disable-dev-shm-usage',
                        'disable-gpu',
                        'headless=new',
                        'disable-extensions',
                        'disable-plugins',
                        'disable-default-apps',
                        'no-default-browser-check',
                        'disable-background-timer-throttling',
                        'disable-backgrounding-occluded-windows',
                        'disable-renderer-backgrounding',
                        'disable-features=TranslateUI,VizDisplayCompositor',
                        'font-render-hinting=none',
                        'disable-font-subpixel-positioning',
                        'force-color-profile=srgb',
                        'disable-web-security',
                        'disable-features=VizDisplayCompositor',
                        'font-cache-shared-handle',
                        'no-first-run',
                        'disable-default-apps',
                        'allow-file-access-from-files',
                        'font-config-path=/etc/fonts',
                    ]);
            })
            ->download($filename);
    }

    public function downloadPng(string $bookmarkCollectionId, Request $request, ?string $type = 'proposals')
    {
        // Find collection bypassing global scopes to access private collections
        $bookmarkCollection = BookmarkCollection::withoutGlobalScope(PublicVisibilityScope::class)
            ->find($bookmarkCollectionId);

        if (! $bookmarkCollection) {
            abort(404);
        }

        // Check access permissions based on visibility and authentication
        if ($bookmarkCollection->visibility === 'public') {
            // Public collections are accessible to everyone - no additional checks needed
        } elseif (Auth::check()) {
            // Private/unlisted collections require authentication and authorization
            try {
                Gate::authorize('view', $bookmarkCollection);
            } catch (AuthorizationException $e) {
                // If authorization fails, return 404 to avoid leaking information
                abort(404);
            }
        } else {
            // Private/unlisted collection accessed by guest user - return 404
            abort(404);
        }

        $defaultPngColumns = ['title', 'budget', 'category', 'openSourced', 'teams'];
        $data = $this->prepareDownloadData($bookmarkCollection, $request, $type, $defaultPngColumns);

        $columnConfig = $this->calculateColumnConfiguration($data['columnsToUse'], 'landscape', 'A4');

        $filename = Str::slug($bookmarkCollection->title ?? 'bookmark-collection').'-'.now()->format('Y-m-d').'.png';

        $html = view('pdf.bookmark-collection', [
            'bookmarkCollection' => $bookmarkCollection->load('author'),
            'proposals' => $data['proposalData'],
            'type' => $data['type'],
            'itemCount' => $data['itemCount'],
            'columns' => $data['columnsToUse'],
            'columnConfig' => $columnConfig,
            'orientation' => 'landscape',
            'exportFormat' => 'png',
            'catalystHeaderLogo' => $data['catalystHeaderLogo'],
            'catalystFooterLogo' => $data['catalystFooterLogo'],
        ])->render();

        $png = Browsershot::html($html)
            ->setChromePath('/usr/bin/chromium')
            ->deviceScaleFactor(2)
            ->windowSize(1920, 1080)
            ->fullPage()
            ->margins(0, 0, 0, 0)
            ->format('png')
            ->timeout(120)
            ->addChromiumArguments([
                'no-sandbox',
                'disable-dev-shm-usage',
                'disable-gpu',
                'headless=new',
                'disable-extensions',
                'disable-plugins',
                'disable-default-apps',
                'no-default-browser-check',
                'disable-background-timer-throttling',
                'disable-backgrounding-occluded-windows',
                'disable-renderer-backgrounding',
                'disable-features=TranslateUI,VizDisplayCompositor',
                'font-render-hinting=none',
                'disable-font-subpixel-positioning',
                'force-color-profile=srgb',
                'disable-web-security',
                'font-config-path=/etc/fonts',
            ])
            ->screenshot();

        return response($png)
            ->header('Content-Type', 'image/png')
            ->header('Content-Disposition', 'attachment; filename="'.$filename.'"');
    }

    /**
     * Get proposals with full user profile data (including avatar URLs) for PDF export
     */
    protected function getProposalsWithFullUserData(string $modelType, array $constrainToIds = [], array $relationships = [], array $counts = [], ?BookmarkCollection $bookmarkCollection = null): array
    {
        if (empty($constrainToIds) || $modelType !== Proposal::class) {
            return [];
        }

        $query = $modelType::query();

        $modifiedRelationships = [];
        foreach ($relationships as $relationship) {
            if ($relationship === 'users') {
                $modifiedRelationships[] = 'users.model';
            } else {
                $modifiedRelationships[] = $relationship;
            }
        }

        if (! empty($modifiedRelationships)) {
            $query->with($modifiedRelationships);
        }

        if (! empty($counts)) {
            $query->withCount($counts);
        }

        $query->whereIn('id', $constrainToIds);

        if ($this->sortBy && $this->sortOrder) {
            $query->orderBy($this->sortBy, $this->sortOrder);
        }

        $allResults = $query->get();

        // Get vote data from bookmark items if collection is provided
        $voteData = [];
        if ($bookmarkCollection) {
            $bookmarkItems = $bookmarkCollection->items()
                ->where('model_type', $modelType)
                ->whereIn('model_id', $constrainToIds)
                ->whereNotNull('vote')
                ->get();

            foreach ($bookmarkItems as $item) {
                $voteData[$item->model_id] = $item->vote?->value;
            }
        }

        $transformedResults = $allResults->map(function ($proposal) use ($voteData) {
            $proposalArray = $proposal->toArray();

            // Add vote data if available
            if (isset($voteData[$proposal->id])) {
                $proposalArray['vote'] = $voteData[$proposal->id];
            }

            if ($proposal->users && $proposal->users->count() > 0) {
                $proposalArray['users'] = $proposal->users->map(function ($proposalProfile) {
                    $profile = $proposalProfile->model;

                    return [
                        'id' => $profile?->id,
                        'name' => $profile?->name,
                        'hero_img_url' => $profile?->hero_img_url,
                        'username' => $profile?->username,
                        'bio' => $profile?->bio,
                    ];
                })->toArray();
            }

            return $proposalArray;
        });

        return $transformedResults->toArray();
    }

    /**
     * Stream bookmark collection items for voter lists
     */
    public function streamBookmarkItems(string $bookmarkCollectionId, Request $request, ?string $type = 'proposals')
    {
        // Find collection without global scope to check if it exists
        $bookmarkCollection = BookmarkCollection::withoutGlobalScope(PublicVisibilityScope::class)
            ->find($bookmarkCollectionId);

        // If collection doesn't exist at all, return 404
        if (! $bookmarkCollection) {
            abort(404);
        }

        // Check access permissions based on visibility and authentication
        if ($bookmarkCollection->visibility === 'public') {
            // Public collections are accessible to everyone - no additional checks needed
        } elseif (Auth::check()) {
            // Private/unlisted collections require authentication and authorization
            try {
                Gate::authorize('view', $bookmarkCollection);
            } catch (AuthorizationException $e) {
                // If authorization fails, return 404 to avoid leaking information
                abort(404);
            }
        } else {
            // Private/unlisted collection accessed by guest user - return 404
            abort(404);
        }

        $this->setFilters($request);

        $model_type = BookmarkableType::from(Str::kebab($type))->getModelClass();

        $relationshipsMap = [
            Proposal::class => ['users', 'fund', 'campaign', 'schedule'],
            Group::class => ['ideascale_profiles'],
            Community::class => ['ideascale_profiles'],
        ];

        $countMap = [
            Group::class => ['proposals', 'funded_proposals'],
            Community::class => ['ideascale_profiles', 'proposals'],
        ];

        $relationships = $relationshipsMap[$model_type] ?? [];
        $counts = $countMap[$model_type] ?? [];

        return response()->stream(function () use ($bookmarkCollection, $model_type, $relationships, $counts) {
            $bookmarkItemsQuery = $bookmarkCollection->items()
                ->where('model_type', $model_type)
                ->with(['model' => function ($query) use ($relationships, $counts) {
                    if (! empty($relationships)) {
                        $query->with($relationships);
                    }
                    if (! empty($counts)) {
                        $query->withCount($counts);
                    }
                }]);

            if ($this->search) {
                $searchBuilder = $model_type::search($this->search);

                if ($this->sortBy && $this->sortOrder) {
                    $searchBuilder->orderBy($this->sortBy, $this->sortOrder);
                }

                $searchResults = $searchBuilder->get();
                $searchIds = $searchResults->pluck('id')->toArray();

                if (empty($searchIds)) {
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

            foreach ($bookmarkItems as $bookmarkItem) {
                if (! $bookmarkItem->model) {
                    continue;
                }

                $proposalData = $bookmarkItem->model->toArray();

                if ($bookmarkItem->vote !== null) {
                    $proposalData['vote'] = $bookmarkItem->vote;
                }

                $json = json_encode($proposalData);

                echo $json."\n";

                if (ob_get_level() > 0) {
                    ob_flush();
                    flush();
                }

                // Small delay to prevent overwhelming the client
                usleep(10000);
            }
        }, 200, [
            'Content-Type' => 'text/plain',
            'X-Accel-Buffering' => 'no',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
        ]);
    }
}
