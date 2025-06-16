<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\DataTransferObjects\BookmarkCollectionData;
use App\DataTransferObjects\ProposalData;
use App\Enums\BookmarkStatus;
use App\Enums\ProposalSearchParams;
use App\Enums\QueryParamsEnum;
use App\Enums\VoteEnum;
use App\Models\BookmarkCollection;
use App\Models\Campaign;
use App\Models\Fund;
use App\Models\Meta;
use App\Models\Proposal;
use App\Repositories\ProposalRepository;
use App\Services\HashIdService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
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
        $bookmarkHash = $request->input(QueryParamsEnum::BOOKMARK_COLLECTION()->value);

        return Inertia::render('Workflows/CreateVoterList/Step2', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'funds' => $funds,
            'latestFund' => $latestFund,
            'voterList' => BookmarkCollectionData::from(BookmarkCollection::byHash($bookmarkHash)?->load('fund')),
        ]);
    }

    public function step3(Request $request): Response
    {
        $fundSlug = $request->input(QueryParamsEnum::FUNDS()->value);
        $bookmarkHash = $request->input(QueryParamsEnum::BOOKMARK_COLLECTION()->value);
        $bookmarkId = null;

        if ($bookmarkHash) {
            $bookmarkId = (new HashIdService(new BookmarkCollection))->decode($bookmarkHash);
        }

        $fund = null;
        if ($fundSlug) {
            $fund = Fund::where('slug', $fundSlug)->first();
        }

        $proposals = [];
        $campaigns = [];
        $selectedProposals = [];

        if ($bookmarkId) {
            $selectedProposals = DB::table('bookmark_items')
                ->where('bookmark_collection_id', $bookmarkId)
                ->where('user_id', $request->user()->id)
                ->pluck('model_id')
                ->toArray();
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
                ProposalData::collect(
                    (new TransformIdsToHashes)->__invoke(
                        collection: collect($response->hits),
                        model: new Proposal
                    )->toArray()
                ),
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
            'bookmarkHash' => $bookmarkHash,
            'fundSlug' => $fundSlug,
        ]);
    }

    public function step4(Request $request): Response
    {
        $bookmarkHash = $request->input(QueryParamsEnum::BOOKMARK_COLLECTION()->value);
        $bookmarkId = null;

        if ($bookmarkHash) {
            $bookmarkId = (new HashIdService(new BookmarkCollection))->decode($bookmarkHash);
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
        ]);
    }

    public function success(Request $request): Response
    {
        return Inertia::render('Workflows/CreateVoterList/Success');
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

        $existingList = BookmarkCollection::byhash($bookmarkHash);

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
            QueryParamsEnum::BOOKMARK_COLLECTION()->value => $bookmarkCollection->hash,
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

        $bookmarkId = (new HashIdService(new BookmarkCollection))->decode($validated['bookmarkHash']);
        $proposalSlugs = $validated['proposals'];
        $proposals = Proposal::whereIn('slug', $proposalSlugs)->get();

        DB::table('bookmark_items')
            ->where('bookmark_collection_id', $bookmarkId)
            ->where('user_id', $request->user()->id)
            ->delete();

        foreach ($proposals as $proposal) {
            $voteValue = $validated['votes'][$proposal->slug] ?? null;

            if ($voteValue !== null && ! in_array($voteValue, VoteEnum::values())) {
                $voteValue = null;
            }

            DB::table('bookmark_items')->insert([
                'bookmark_collection_id' => $bookmarkId,
                'user_id' => $request->user()->id,
                'model_type' => Proposal::class,
                'model_id' => $proposal->id,
                'vote' => $voteValue,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return to_route('workflows.createVoterList.index', [
            'step' => 4,
            QueryParamsEnum::BOOKMARK_COLLECTION()->value => $validated['bookmarkHash'],
        ]);
    }

    public function saveRationales(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rationale' => 'required|string',
            'bookmarkHash' => 'required|string',
        ]);

        $bookmarkId = (new HashIdService(new BookmarkCollection))->decode($validated['bookmarkHash']);

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

        return to_route('workflows.createVoterList.success');
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
        ]);
    }
}
