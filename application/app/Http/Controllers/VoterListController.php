<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\BookmarkCollectionData;
use App\DataTransferObjects\BookmarkItemData;
use App\DataTransferObjects\ProposalData;
use App\Enums\BookmarkStatus;
use App\Enums\ProposalSearchParams;
use App\Enums\QueryParamsEnum;
use App\Enums\VoteEnum;
use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Campaign;
use App\Models\Fund;
use App\Models\Meta;
use App\Models\Proposal;
use App\Models\Signature;
use App\Repositories\ProposalRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Fluent;
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

        return Inertia::render('Workflows/CreateVoterList/Step2', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'funds' => $funds,
            'latestFund' => $latestFund,
            'voterList' => BookmarkCollectionData::from(BookmarkCollection::find($bookmarkHash)?->load('fund')),
        ]);
    }

    public function step3(Request $request): Response
    {
        $fundSlug = $request->input(QueryParamsEnum::FUNDS()->value);
        $bookmarkHash = $request->input(QueryParamsEnum::BOOKMARK_COLLECTION()->value);
        $bookmarkCollection = null;

        if ($bookmarkHash) {
            $bookmarkCollection = BookmarkCollection::find($bookmarkHash);
        }

        $fund = Fund::find($bookmarkCollection->fund_id);

        $proposals = [];
        $campaigns = [];
        $selectedProposals = [];

        if ($bookmarkCollection) {
            $selectedProposals = BookmarkItem::where('bookmark_collection_id', $bookmarkCollection->id)
                ->where('user_id', $request->user()->id)
                ->where('model_type', Proposal::class)->get()
                ->flatMap(
                    fn ($item) => [
                        [
                            'hash' => optional(Proposal::find($item->model_id))->id,
                            'vote' => $item->vote?->value,
                        ],
                    ]
                )->toArray();
        }

        if ($fund) {
            $campaigns = Campaign::where('fund_id', $fund->id)->get();
            $page = $request->input(ProposalSearchParams::PAGE()->value, default: 1);
            $limit = $request->input('limit', 24);
            $search = $request->input(ProposalSearchParams::QUERY()->value, '');
            $campaignHash = $request->input(ProposalSearchParams::CAMPAIGNS()->value);
            $sort = $request->input(ProposalSearchParams::SORTS()->value);

            $search = (string) $search;

            $filters = [];

            if (! empty($campaignHash)) {
                $filters[] = "campaign.hash = {$campaignHash}";
            }

            $filters[] = "fund.id = {$fund->id}";

            $args = [
                'filter' => $filters,
                'limit' => $limit,
                'offset' => ($page - 1) * $limit,
            ];

            if (! empty($sort)) {
                $sortParts = explode(':', $sort);
                $sortField = $sortParts[0];
                $sortDirection = $sortParts[1] ?? 'asc';
                $args['sort'] = ["{$sortField}:{$sortDirection}"];
            }

            $repository = app(ProposalRepository::class);
            $searchBuilder = $repository->search($search, $args);
            $response = new Fluent($searchBuilder->raw());

            $proposals = new LengthAwarePaginator(
                ProposalData::collect(collect($response->hits)->toArray()),
                $response->estimatedTotalHits,
                $limit,
                $page,
                [
                    'pageName' => 'p',
                    'onEachSide' => 0,
                ]
            );
        }

        $filters = [];

        if ($request->has(ProposalSearchParams::QUERY()->value)) {
            $filters[ProposalSearchParams::QUERY()->value] = $request->input(ProposalSearchParams::QUERY()->value);
        }

        if ($request->has(ProposalSearchParams::CAMPAIGNS()->value)) {
            $filters[ProposalSearchParams::CAMPAIGNS()->value] = $request->input(ProposalSearchParams::CAMPAIGNS()->value);
        }

        if ($request->has(ProposalSearchParams::SORTS()->value)) {
            $filters[ProposalSearchParams::SORTS()->value] = $request->input(ProposalSearchParams::SORTS()->value);
        }

        if ($fundSlug) {
            $filters[QueryParamsEnum::FUNDS()->value] = $fundSlug;
        }

        if ($bookmarkHash) {
            $filters[QueryParamsEnum::BOOKMARK_COLLECTION()->value] = $bookmarkHash;
        }

        $filters[ProposalSearchParams::PAGE()->value] = $request->input(ProposalSearchParams::PAGE()->value, 1);

        return Inertia::render('Workflows/CreateVoterList/Step3', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'proposals' => $proposals,
            'campaigns' => $campaigns,
            'selectedProposals' => $selectedProposals,
            'filters' => $filters,
            // 'bookmarkHash' => $bookmarkHash,
            'fundSlug' => $fundSlug,
        ]);
    }

    public function step4(Request $request): Response
    {
        $bookmarkHash = $request->input(QueryParamsEnum::BOOKMARK_COLLECTION()->value) ?? $request->input('bookmarkId');
        $bookmarkId = null;

        if ($bookmarkHash) {
            $bookmarkId = $bookmarkHash;
        }

        $selectedProposals = [];
        $rationale = null;

        if ($bookmarkId) {
            $selectedProposals = DB::table('bookmark_items')
                ->where('bookmark_collection_id', $bookmarkId)
                ->where('user_id', $request->user()->id)
                ->pluck('model_id')
                ->toArray();

            $rationaleRecord = Meta::where('model_type', BookmarkCollection::class)
                ->where('model_id', $bookmarkId)
                ->where('key', 'rationale')
                ->first();

            if ($rationaleRecord) {
                $rationale = $rationaleRecord->content;
            }
        }

        return Inertia::render('Workflows/CreateVoterList/Step4', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'selectedProposals' => $selectedProposals,
            'rationale' => $rationale,
            'bookmarkHash' => $bookmarkHash,
            'bookmarkId' => $bookmarkHash,
            'bookmarkId' => $bookmarkHash,
        ]);
    }

    public function step5(Request $request): Response
    {
        $bookmarkHash = $request->input(QueryParamsEnum::BOOKMARK_COLLECTION()->value);

        return Inertia::render('Workflows/CreateVoterList/Step5', [
            'stepDetails' => [],
            'activeStep' => intval($request->step),
            'bookmarkHash' => $bookmarkHash,
            'bookmarkId' => $bookmarkHash,
        ]);
    }

    public function step6(Request $request): Response
    {
        $bookmarkHash = $request->input(key: QueryParamsEnum::BOOKMARK_COLLECTION()->value) ?? $request->input('bookmarkId');

        $bookmarkCollection = BookmarkCollection::find($bookmarkHash)?->load('fund');

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

    public function step7(Request $request): Response
    {
        $bookmarkHash = $request->input(key: QueryParamsEnum::BOOKMARK_COLLECTION()->value);

        return Inertia::render('Workflows/CreateVoterList/Step7', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'bookmarkHash' => $bookmarkHash,
        ]);
    }

    public function step8(Request $request): Response
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

    public function step9(Request $request): Response
    {
        $bookmarkHash = $request->input(key: QueryParamsEnum::BOOKMARK_COLLECTION()->value);

        $bookmarkCollection = BookmarkCollection::find($bookmarkHash)?->load('fund');

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

    public function success(Request $request): Response
    {
        return Inertia::render('Workflows/CreateVoterList/Success');
    }

    public function signBallot(Request $request): RedirectResponse
    {
        $bookmarkHash = $request->input(key: QueryParamsEnum::BOOKMARK_COLLECTION()->value);

        $list = BookmarkCollection::find($bookmarkHash);

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
            'step' => 8,
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

        $existingList = BookmarkCollection::find($bookmarkHash);

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
            QueryParamsEnum::FUNDS()->value => $validated['fund_slug'],
        ]);
    }

    public function saveProposals(Request $request): RedirectResponse
    {

        $validated = $request->validate([
            'proposals' => 'required|array',
            'votes' => 'array',
            'bookmarkHash' => 'required|string',
        ]);

        $collection = BookmarkCollection::find($validated['bookmarkHash']);

        $proposals = $validated['proposals'];

        foreach ($proposals as $proposal) {
            $voteValue = $proposal['vote'] ?? null;

            if ($voteValue !== null && ! in_array($voteValue, VoteEnum::values())) {
                $voteValue = null;
            }

            $conditions = [
                'bookmark_collection_id' => $collection->id,
                'model_type' => Proposal::class,
                'model_id' => $proposal['hash'],
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

        Meta::where('model_type', BookmarkCollection::class)
            ->where('model_id', $bookmarkId)
            ->where('key', 'rationale')
            ->delete();

        Meta::create([
            'model_type' => BookmarkCollection::class,
            'model_id' => $bookmarkId,
            'key' => 'rationale',
            'content' => $validated['rationale'],
        ]);

        $bookmark = BookmarkCollection::find($bookmarkId);
        if ($bookmark && $bookmark->status === BookmarkStatus::DRAFT()->value) {
            $bookmark->update(['status' => BookmarkStatus::PUBLISHED()->value]);
        }

        return to_route('workflows.createVoterList.index', [
            'step' => 5,
            QueryParamsEnum::BOOKMARK_COLLECTION()->value => $bookmark->id,
        ]);
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
                'title' => 'workflows.voterList.steps.rationale',
                'info' => 'workflows.voterList.steps.rationaleInfo',
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
}
