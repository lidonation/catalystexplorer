<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\GetProposalFromScout;
use App\Actions\GetUserFilters;
use App\DataTransferObjects\BookmarkCollectionData;
use App\DataTransferObjects\BookmarkItemData;
use App\Enums\BookmarkStatus;
use App\Enums\ProposalSearchParams;
use App\Enums\QueryParamsEnum;
use App\Enums\VoteEnum;
use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Campaign;
use App\Models\Comment;
use App\Models\Fund;
use App\Models\Proposal;
use App\Models\Signature;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use ReflectionMethod;

class VoterListController extends Controller
{
    public function handleStep(Request $request, $step): mixed
    {
        $method = "step{$step}";

        if (method_exists($this, $method)) {
            $reflection = new ReflectionMethod($this, $method);

            return $this->$method($request);
        }

        abort(404, "Step '{$step}' not found.");
    }

    public function step1(Request $request): Response
    {
        return Inertia::render('Workflows/CreateVoterList/Step1', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step2(Request $request): Response
    {
        $funds = Fund::orderBy('created_at', 'desc')->get();
        $latestFund = $funds->first();
        $bookmarkHash = $request->input(QueryParamsEnum::BOOKMARK_COLLECTION()->value) ?? $request->input('bookmarkId');
        $activeFundId = Fund::latest('launched_at')
            ->pluck('id')
            ->first();

        return Inertia::render('Workflows/CreateVoterList/Step2', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'funds' => $funds,
            'latestFund' => $latestFund,
            'voterList' => BookmarkCollectionData::from(BookmarkCollection::allVisibilities()->find($bookmarkHash)?->load('fund')),
        ]);
    }

    public function step3(Request $request): Response
    {
        $fundParam = $request->input(QueryParamsEnum::FUNDS()->value);
        $bookmarkId = $request->input('bookmarkCollection') ?? $request->input(QueryParamsEnum::BOOKMARK_COLLECTION()->value);
        $bookmarkCollection = null;
        $fund = null;
        $fundSlug = null;
        $activeFundId = Fund::latest('launched_at')
            ->pluck('id')
            ->first();

        if ($bookmarkId) {
            $bookmarkCollection = BookmarkCollection::allVisibilities()->find($bookmarkId);
        }

        // Handle fund parameter - could be ID or slug
        if ($fundParam) {
            if (is_numeric($fundParam)) {
                $fund = Fund::find($fundParam);
                $fundSlug = $fund?->slug;
            } else {
                $fund = Fund::where('slug', $fundParam)->first();
                $fundSlug = $fundParam;
            }
        }

        $modifiedRequest = $request->duplicate();
        if ($fund) {
            $modifiedRequest->merge([
                QueryParamsEnum::FUNDS()->value => $fund->id,
            ]);
        } elseif ($bookmarkCollection && $bookmarkCollection->fund_id) {
            // When modifying an existing voter list, limit results to the collection's fund
            $modifiedRequest->merge([
                QueryParamsEnum::FUNDS()->value => $bookmarkCollection->fund_id,
            ]);
            $fund = Fund::find($bookmarkCollection->fund_id);
            $fundSlug = $fund?->slug;
        }

        $filters = app(GetUserFilters::class)($modifiedRequest);
        $selectedProposals = [];

        if ($bookmarkCollection) {
            // Get all items in the collection, not just items from the current user
            // This allows creating voter lists from existing bookmark collections
            // that may have been created by other users or contain items from multiple users
            $bookmarkItems = BookmarkItem::where('bookmark_collection_id', $bookmarkCollection->id)
                ->where('model_type', Proposal::class)->get();

            $selectedProposals = $bookmarkItems->flatMap(
                function ($item) {
                    $proposal = Proposal::withoutGlobalScopes()->find($item->model_id);

                    return [
                        [
                            'id' => $proposal?->id,
                            'vote' => $item->vote?->value,
                        ],
                    ];
                }
            )->toArray();
        }

        if ($bookmarkCollection?->fund_id) {
            $campaigns = Campaign::where('fund_id', $bookmarkCollection?->fund_id)->get();
        } elseif ($request->has(QueryParamsEnum::CAMPAIGNS()->value)) {
            $campaigns = Campaign::where('fund_id', $activeFundId)->get();
        } else {
            $campaigns = Campaign::where('fund_id', $fund?->id ?? $activeFundId)->get();
        }

        $proposals = $this->getProposals($request, $filters);

        // If we have existing bookmark proposals, ensure they're included in the results
        // even if they don't match current search criteria
        if ($bookmarkCollection && ! empty($selectedProposals)) {
            $existingProposalIds = collect($selectedProposals)->pluck('id')->filter()->toArray();
            $proposalDataIds = collect($proposals->items())->pluck('id')->toArray();
            $missingProposalIds = array_diff($existingProposalIds, $proposalDataIds);

            if (! empty($missingProposalIds)) {
                // Load the missing proposals that aren't in search results
                $missingProposals = Proposal::withoutGlobalScopes()
                    ->whereIn('id', $missingProposalIds)
                    ->with(['fund', 'campaign'])
                    ->get();

                // Convert to ProposalData format
                $missingProposalData = $missingProposals->map(function ($proposal) {
                    return \App\DataTransferObjects\ProposalData::from($proposal);
                });

                // Merge with existing proposals (put existing bookmarked proposals first)
                $allProposals = $missingProposalData->concat(collect($proposals->items()));

                // Create a new paginator with merged results
                $proposals = new \Illuminate\Pagination\LengthAwarePaginator(
                    $allProposals->take($proposals->perPage()),
                    $allProposals->count(),
                    $proposals->perPage(),
                    $proposals->currentPage(),
                    [
                        'path' => $proposals->path(),
                        'pageName' => 'page',
                    ]
                );
                $proposals->appends($request->query());
            }
        }

        // Get the original request parameters for frontend filtering
        $frontendFilters = $request->only([
            ProposalSearchParams::QUERY()->value,
            ProposalSearchParams::PAGE()->value,
            ProposalSearchParams::FUNDS()->value,
            ProposalSearchParams::CAMPAIGNS()->value,
            ProposalSearchParams::TAGS()->value,
            ProposalSearchParams::SORTS()->value,
            ProposalSearchParams::FUNDING_STATUS()->value,
            ProposalSearchParams::PROJECT_STATUS()->value,
            ProposalSearchParams::OPENSOURCE_PROPOSALS()->value,
            ProposalSearchParams::TYPE()->value,
            ProposalSearchParams::QUICK_PITCHES()->value,
            ProposalSearchParams::BUDGETS()->value,
            ProposalSearchParams::IDEASCALE_PROFILES()->value,
            ProposalSearchParams::CATALYST_PROFILES()->value,
            ProposalSearchParams::GROUPS()->value,
            ProposalSearchParams::COMMUNITIES()->value,
            ProposalSearchParams::PROJECT_LENGTH()->value,
            ProposalSearchParams::COHORT()->value,
            QueryParamsEnum::BOOKMARK_COLLECTION()->value,
        ]);

        // Ensure fund filter is set when modifying an existing voter list
        if ($bookmarkCollection && $bookmarkCollection->fund_id && ! ($frontendFilters[ProposalSearchParams::FUNDS()->value] ?? null)) {
            $frontendFilters[ProposalSearchParams::FUNDS()->value] = $bookmarkCollection->fund_id;
        }

        return Inertia::render('Workflows/CreateVoterList/Step3', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'proposals' => $proposals,
            'campaigns' => $campaigns ?? [],
            'selectedProposals' => $selectedProposals,
            'filters' => $frontendFilters,
            'bookmarkHash' => $bookmarkId,
            'fundSlug' => $fundSlug,
        ]);
    }

    public function step4(Request $request): Response
    {
        $bookmarkHash = $request->input(QueryParamsEnum::BOOKMARK_COLLECTION()->value);

        $bookmarkCollection = null;
        if ($bookmarkHash) {
            $bookmarkCollection = BookmarkCollection::allVisibilities()->find($bookmarkHash);
        }

        return Inertia::render('Workflows/CreateVoterList/Step5', [
            'stepDetails' => [],
            'activeStep' => intval($request->step),
            'bookmarkHash' => $bookmarkHash,
            'bookmarkId' => $bookmarkHash,
            'bookmarkCollection' => $bookmarkCollection ? BookmarkCollectionData::from($bookmarkCollection) : null,
        ]);
    }

    public function step5(Request $request): Response
    {
        $bookmarkHash = $request->input(key: QueryParamsEnum::BOOKMARK_COLLECTION()->value) ?? $request->input('bookmarkId');

        $bookmarkCollection = BookmarkCollection::allVisibilities()
            ->findOrFail($bookmarkHash)->load('fund');

        $page = (int) $request->input(ProposalSearchParams::PAGE()->value, 1);
        $limit = (int) $request->input('limit', 8);

        $items = $bookmarkCollection->proposals()->with('model')->paginate($limit, ['*'], 'p', $page);

        $paginatedItems = to_length_aware_paginator(
            BookmarkItemData::collect($items),
        )->onEachSide(0);

        return Inertia::render('Workflows/CreateVoterList/Step6', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'selectedProposals' => $paginatedItems,
            'bookmarkCollection' => BookmarkCollectionData::from($bookmarkCollection),
            'filters' => [
                ProposalSearchParams::PAGE()->value => $page,
                QueryParamsEnum::BOOKMARK_COLLECTION()->value => $bookmarkHash,
            ],
        ]);
    }

    public function step6(Request $request): Response
    {
        $bookmarkHash = $request->input(key: QueryParamsEnum::BOOKMARK_COLLECTION()->value);

        return Inertia::render('Workflows/CreateVoterList/Step7', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'bookmarkHash' => $bookmarkHash,
        ]);
    }

    public function step7(Request $request): Response
    {
        $bookmarkHash = $request->input(key: QueryParamsEnum::BOOKMARK_COLLECTION()->value);

        return Inertia::render('Workflows/CreateVoterList/Step8', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'bookmarkHash' => $bookmarkHash,
            'bookmarkId' => $bookmarkHash,
            // 'wallet' => $wallet,
        ]);
    }

    public function step8(Request $request): Response
    {
        $bookmarkHash = $request->input(key: QueryParamsEnum::BOOKMARK_COLLECTION()->value);

        $bookmarkCollection = BookmarkCollection::allVisibilities()
            ->find($bookmarkHash)?->load('fund');

        $page = (int) $request->input(ProposalSearchParams::PAGE()->value, 1);
        $limit = (int) $request->input('limit', 5);

        $items = $bookmarkCollection->proposals()->with('model')->paginate($limit, ['*'], 'p', $page);

        $paginatedItems = to_length_aware_paginator(
            BookmarkItemData::collect($items),
        )->onEachSide(0);

        return Inertia::render('Workflows/CreateVoterList/Step9', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'selectedProposals' => $paginatedItems,
            'bookmarkCollection' => BookmarkCollectionData::from($bookmarkCollection),
            'filters' => [
                ProposalSearchParams::PAGE()->value => $page,
                QueryParamsEnum::BOOKMARK_COLLECTION()->value => $bookmarkHash,
            ],
        ]);
    }

    public function step9(Request $request): Response
    {
        return Inertia::render('Workflows/CreateVoterList/Success');
    }

    public function success(Request $request): Response
    {
        return Inertia::render('Workflows/CreateVoterList/Success');
    }

    public function signBallot(Request $request): RedirectResponse
    {
        $bookmarkHash = $request->input(key: QueryParamsEnum::BOOKMARK_COLLECTION()->value);

        $list = BookmarkCollection::allVisibilities()
            ->find($bookmarkHash);

        $stakeAddressPattern = app()->environment('production')
            ? '/^stake1[0-9a-z]{38,}$/'
            : '/^stake_test1[0-9a-z]{38,}$/';

        $validated = $request->validate([
            'signature' => 'required|string',
            'signature_key' => 'required|string',
            'stake_key' => 'required|string',
            'stakeAddress' => [
                'required',
                "regex:$stakeAddressPattern",
            ],
        ]);

        // Create or update the signature
        $signature = Signature::updateOrCreate(
            [
                'stake_key' => $validated['stake_key'],
                'stake_address' => $validated['stakeAddress'],
                'user_id' => Auth::id(),
            ],
            $validated
        );

        // Attach the signature to the list if not already attached
        $list->modelSignatures()->firstOrCreate([
            'model_id' => $list->id,
            'model_type' => BookmarkCollection::class,
            'signature_id' => $signature->id,
        ]);

        return to_route('workflows.createVoterList.index', [
            'step' => 7,
            QueryParamsEnum::BOOKMARK_COLLECTION()->value => $list->eid,
        ]);
    }

    public function saveListDetails(Request $request): RedirectResponse
    {

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'visibility' => 'required|string',
            'fund_slug' => 'required|string',
            'content' => 'nullable|string',
            'comments_enabled' => 'nullable|boolean',
            'color' => 'nullable|string|max:7',
            'status' => 'nullable|string',
        ]);

        $bookmarkHash = $request->input(QueryParamsEnum::BOOKMARK_COLLECTION()->value);

        $existingList = BookmarkCollection::allVisibilities()
            ->find($bookmarkHash);

        $fund = Fund::where('slug', $validated['fund_slug'])->first();

        if ($existingList) {
            $existingList->update([
                'user_id' => $request->user()->id,
                'title' => $validated['title'],
                'content' => $validated['content'] ?? null,
                'color' => $validated['color'] ?? '#2596BE',
                'allow_comments' => $validated['comments_enabled'] ?? false,
                'visibility' => $validated['visibility'],
                'status' => $validated['status'] ?? BookmarkStatus::DRAFT()->value,
                'fund_id' => $fund?->id,
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
                'fund_id' => $fund?->id,
            ]);
        }

        return to_route('workflows.createVoterList.index', [
            'step' => 3,
            QueryParamsEnum::BOOKMARK_COLLECTION()->value => $bookmarkCollection->id,
            QueryParamsEnum::FUNDS()->value => $fund?->id,
        ]);
    }

    public function saveProposals(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'proposals' => 'required|array',
            'votes' => 'array',
            'bookmarkHash' => 'required|string',
        ]);

        $collection = BookmarkCollection::allVisibilities()
            ->find($validated['bookmarkHash']);

        $proposals = $validated['proposals'];

        foreach ($proposals as $proposal) {
            $voteValue = $proposal['vote'] ?? null;

            if ($voteValue !== null && ! in_array($voteValue, VoteEnum::values())) {
                $voteValue = null;
            }

            $conditions = [
                'bookmark_collection_id' => $collection->id,
                'model_type' => Proposal::class,
                'model_id' => $proposal['id'],
                'user_id' => $request->user()->id,
            ];

            if ($voteValue === null) {
                BookmarkItem::where($conditions)->delete();
            } else {
                BookmarkItem::updateOrInsert($conditions, ['vote' => $voteValue]);
            }
        }

        $collection->searchable();

        return to_route('workflows.createVoterList.index', [
            'step' => 4,
            QueryParamsEnum::BOOKMARK_COLLECTION()->value => $collection->id,
        ]);
    }

    public function saveRationales(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rationale' => 'required|string',
            QueryParamsEnum::BOOKMARK_COLLECTION()->value => 'required|string',
        ]);

        $bookmarkId = $validated[QueryParamsEnum::BOOKMARK_COLLECTION()->value];
        $bookmarkCollection = BookmarkCollection::allVisibilities()
            ->find($bookmarkId);

        Comment::create([
            'commentable_type' => BookmarkCollection::class,
            'commentable_id' => $bookmarkCollection->id,
            'text' => $validated['rationale'],
            'original_text' => $validated['rationale'],
            'commentator_id' => auth()->user()?->id,
            'extra' => ['type' => 'rationale'],
        ]);

        if ($bookmarkCollection && $bookmarkCollection->status === BookmarkStatus::DRAFT()->value) {
            $bookmarkCollection->update(['status' => BookmarkStatus::PUBLISHED()->value]);
        }

        return to_route('workflows.createVoterList.index', [
            'step' => 5,
            QueryParamsEnum::BOOKMARK_COLLECTION()->value => $bookmarkCollection->id,
        ]);
    }

    public function removeBookmarkItem(Request $request, $bookmarkCollectionId): \Illuminate\Http\JsonResponse
    {
        $bookmarkCollection = BookmarkCollection::allVisibilities()->find($bookmarkCollectionId);

        if (! $bookmarkCollection) {
            return response()->json(['error' => 'Bookmark collection not found'], 404);
        }

        // Check authorization
        Gate::authorize('removeItems', $bookmarkCollection);

        $validated = $request->validate([
            'modelType' => ['required', 'string'],
            'hash' => ['required', 'string'],
        ]);

        $bookmarkableTypeEnum = \App\Enums\BookmarkableType::tryFrom(Str::kebab($validated['modelType']));
        if (! $bookmarkableTypeEnum) {
            return response()->json([
                'error' => "Invalid model type: {$validated['modelType']}",
            ], 400);
        }

        $bookmarkableType = $bookmarkableTypeEnum->getModelClass();
        $model = $bookmarkableType::find($validated['hash']);

        if (empty($model)) {
            return response()->json([
                'error' => "Item {$validated['modelType']} with hash {$validated['hash']} not found.",
            ], 404);
        }

        // Remove any bookmark item in this collection for this model (not just current user's)
        $bookmark = BookmarkItem::where('bookmark_collection_id', $bookmarkCollection->id)
            ->where('model_id', $model->id)
            ->where('model_type', $bookmarkableType)
            ->first();

        if (! $bookmark) {
            return response()->json(['error' => 'Bookmark item not found in collection'], 404);
        }

        $bookmark->delete();
        $bookmarkCollection->searchable();

        return response()->json(['success' => 'Bookmark item removed from collection']);
    }

    public function getStepDetails(): Collection
    {
        return collect([
            [
                'title' => 'workflows.voterList.steps.details',
            ],
            [
                'title' => 'workflows.voterList.steps.listDetail',
                'info' => 'workflows.voterList.steps.listDetailInfo',
            ],
            [
                'title' => 'workflows.voterList.steps.proposals',
                'info' => 'workflows.voterList.steps.proposalsInfo',
            ],
            [
                'title' => 'workflows.voterList.steps.listCreated',
            ],
            [
                'title' => 'workflows.voterList.steps.votesSummary',
                'info' => 'workflows.voterList.steps.votesSummaryInfo',
            ],
            [
                'title' => 'workflows.voterList.steps.connectWallet',
                'info' => 'workflows.voterList.steps.connectWalletInfo',
            ],
            [
                'title' => 'workflows.voterList.steps.submitVotes',
                'info' => 'workflows.voterList.steps.submitReviewedVotesInfo',
            ],
            [
                'title' => 'workflows.voterList.steps.submission',
                'info' => 'workflows.voterList.steps.submissionInfo',
            ],
            [
                'title' => 'workflows.voterList.success.title',
                'info' => 'workflows.voterList.success.successInfo',
            ],
        ]);
    }

    protected function getProposals(Request $request, array $filters = []): LengthAwarePaginator
    {
        $page = (int) $request->input(ProposalSearchParams::PAGE()->value, default: 1) ?? 1;
        $limit = (int) $request->input('limit', 24);
        $search = $request->input(ProposalSearchParams::QUERY()->value, '');
        $sort = $request->input(ProposalSearchParams::SORTS()->value);

        if (is_array($sort)) {
            $sort = $sort[0] ?? '';
        }

        $sort = (string) $sort;

        $search = (string) $search;

        return (new GetProposalFromScout)(
            search: $search,
            filters: $filters,
            sort: $sort,
            limit: $limit,
            page: $page
        );
    }
}
