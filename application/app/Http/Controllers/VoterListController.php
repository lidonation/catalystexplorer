<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\DataTransferObjects\ProposalData;
use App\Enums\BookmarkStatus;
use App\Enums\ProposalSearchParams;
use App\Enums\VoteEnum;
use App\Models\BookmarkCollection;
use App\Models\Campaign;
use App\Models\Fund;
use App\Models\Meta;
use App\Models\Proposal;
use App\Repositories\ProposalRepository;
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

        return Inertia::render('Workflows/CreateVoterList/Step2', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'funds' => $funds,
            'latestFund' => $latestFund,
            'voterList' => session()->get('voter_list_draft', []),
        ]);
    }

    public function step3(Request $request): Response
    {
        $fundSlug = session()->get('voter_list_draft.fund_slug');

        $fund = null;
        if ($fundSlug) {
            $fund = Fund::where('slug', $fundSlug)->first();
        }

        $proposals = [];
        $campaigns = [];

        if ($fund) {

            $campaigns = Campaign::where('fund_id', $fund->id)->get();
            $page = $request->input(ProposalSearchParams::PAGE()->value, default: 1);
            $limit = $request->input('limit', 3);
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
                    (new TransformIdsToHashes)(
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

        $filters[ProposalSearchParams::PAGE()->value] = $request->input(ProposalSearchParams::PAGE()->value, 1);

        return Inertia::render('Workflows/CreateVoterList/Step3', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'proposals' => $proposals,
            'campaigns' => $campaigns,
            'selectedProposals' => session()->get('voter_list_draft.proposals', []),
            'filters' => $filters,
        ]);
    }

    public function step4(Request $request): Response
    {
        return Inertia::render('Workflows/CreateVoterList/Step4', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'selectedProposals' => session()->get('voter_list_draft.proposals', []),
            'rationales' => session()->get('voter_list_draft.rationales', []),
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

        $bookmarkData = [
            'title' => $validated['title'],
            'content' => $validated['content'] ?? null,
            'visibility' => strtoupper($validated['visibility']),
            'color' => $validated['color'] ?? '#2596BE',
            'allow_comments' => $validated['comments_enabled'] ?? false,
            'status' => strtoupper($validated['status'] ?? 'DRAFT'),
            'fund_slug' => $validated['fund_slug'],
        ];

        session()->put('voter_list_draft', array_merge(
            session()->get('voter_list_draft', []),
            $bookmarkData
        ));

        return to_route('workflows.createVoterList.index', ['step' => 3]);
    }

    public function saveProposals(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'proposals' => 'required|array',
            'votes' => 'array',
        ]);

        $proposalSlugs = $validated['proposals'];
        $proposals = Proposal::whereIn('slug', $proposalSlugs)->get();

        session()->put('voter_list_draft.proposals', $proposals->pluck('id')->toArray());

        session()->put('voter_list_draft.votes', $validated['votes'] ?? []);

        return to_route('workflows.createVoterList.index', ['step' => 4]);
    }

    public function saveRationales(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rationale' => 'required|string',
        ]);

        session()->put('voter_list_draft.rationale', $validated['rationale']);

        return $this->finalizeVoterList($request);
    }

    public function finalizeVoterList(Request $request): RedirectResponse
    {
        $draftData = session()->get('voter_list_draft');

        if (empty($draftData)) {
            return to_route('workflows.createVoterList.index', ['step' => 1])
                ->with('error', 'No draft data found. Please start over.');
        }

        $bookmarkCollection = BookmarkCollection::create([
            'user_id' => $request->user()->id,
            'title' => $draftData['title'],
            'content' => $draftData['content'] ?? null,
            'color' => $draftData['color'] ?? '#2596BE',
            'allow_comments' => $draftData['allow_comments'] ?? false,
            'visibility' => $draftData['visibility'],
            'status' => $draftData['status'] ?? BookmarkStatus::DRAFT()->value,
            'type' => BookmarkCollection::class,
            'type_id' => $draftData['fund_slug'],
        ]);

        if (! empty($draftData['proposals'])) {
            $proposals = Proposal::whereIn('id', $draftData['proposals'])->get();

            foreach ($proposals as $proposal) {
                $voteValue = $draftData['votes'][$proposal->slug] ?? null;

                if ($voteValue !== null && ! in_array($voteValue, VoteEnum::values())) {
                    $voteValue = null;
                }

                DB::table('bookmark_items')->insert([
                    'bookmark_collection_id' => $bookmarkCollection->getRawOriginal('id'),
                    'user_id' => $request->user()->id,
                    'model_type' => Proposal::class,
                    'model_id' => $proposal->id,
                    'vote' => $voteValue,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        if (! empty($draftData['rationale'])) {
            Meta::create([
                'model_type' => BookmarkCollection::class,
                'model_id' => $bookmarkCollection->getRawOriginal('id'),
                'key' => 'rationale',
                'content' => $draftData['rationale'],
            ]);
        }

        session()->forget('voter_list_draft');

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
