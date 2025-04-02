<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\DataTransferObjects\ProposalData;
use App\Enums\BookmarkStatus;
use App\Enums\BookmarkVisibility;
use App\Enums\ProposalSearchParams;
use App\Models\BookmarkCollection;
use App\Models\Campaign;
use App\Models\Fund;
use App\Models\Proposal;
use App\Repositories\ProposalRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;
use ReflectionMethod;
use Illuminate\Support\Facades\DB;

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
        // Get all funds and the latest fund for default selection
        $funds = Fund::all();
        $latestFund = Fund::latest()->first();

        return Inertia::render('Workflows/CreateVoterList/Step2', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'funds' => $funds,
            'latestFund' => $latestFund,
            'voterList' => session()->get('voter_list_draft', [])
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
            // Get campaigns for this fund for the dropdown
            $campaigns = Campaign::where('fund_id', $fund->id)->get();

            // Use enum values for filter parameters (matching the rest of the app)
            $page = $request->input(ProposalSearchParams::PAGE()->value, default: 1);
            $limit = $request->input('limit', 36);
            $search = $request->input(ProposalSearchParams::QUERY()->value, '');
            $campaignHash = $request->input(ProposalSearchParams::CAMPAIGNS()->value);
            $sort = $request->input(ProposalSearchParams::SORTS()->value);

            // Ensure $search is a string, not null
            $search = (string)$search;

            $filters = [];

            // Add campaign filter if provided
            if (!empty($campaignHash)) {
                $filters[] = "campaign.hash = {$campaignHash}";
            }

            $filters[] = "fund.id = {$fund->id}";

            // Set up arguments for MeiliSearch
            $args = [
                'filter' => $filters,
                'limit' => $limit,
                'offset' => ($page - 1) * $limit,
            ];

            // Add sort parameter only if provided
            if (!empty($sort)) {
                $sortParts = explode(':', $sort);
                $sortField = $sortParts[0];
                $sortDirection = $sortParts[1] ?? 'asc';
                $args['sort'] = ["{$sortField}:{$sortDirection}"];
            }

            // Use the repository to search
            $repository = app(ProposalRepository::class);
            $searchBuilder = $repository->search($search, $args);
            $response = new Fluent($searchBuilder->raw());

            // Create paginator from results
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

        // Build filters object using enum values for keys, only including params that exist
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
            'filters' => $filters
        ]);
    }

    public function step4(Request $request): Response
    {
        return Inertia::render('Workflows/CreateVoterList/Step4', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'selectedProposals' => session()->get('voter_list_draft.proposals', []),
            'rationales' => session()->get('voter_list_draft.rationales', [])
        ]);
    }

    public function step5(Request $request): Response
    {
        return Inertia::render('Workflows/CreateVoterList/Step5', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'voterList' => session()->get('voter_list_draft', [])
        ]);
    }

    public function saveListDetails(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'visibility' => 'required|string',
            'fund_slug' => 'required|string', // Added numeric to ensure type conversion
            'description' => 'nullable|string',
            'comments_enabled' => 'nullable|boolean',
            'color' => 'nullable|string|max:7',
            'status' => 'nullable|string',
        ]);

        $bookmarkData = [
            'title' => $validated['title'],
            'content' => $validated['description'] ?? null,
            'visibility' => strtoupper($validated['visibility']), // Make sure it matches the enum
            'color' => $validated['color'] ?? '#2596BE',
            'allow_comments' => $validated['comments_enabled'] ?? false,
            'status' => strtoupper($validated['status'] ?? 'DRAFT'), // Make sure it matches the enum
            'fund_slug' => $validated['fund_slug'], // Store fund_slug for later use
        ];

        // Create bookmark collection early in the process
        $bookmarkCollection = BookmarkCollection::create([
            'user_id' => $request->user()->id,
            'title' => $bookmarkData['title'],
            'content' => $bookmarkData['content'],
            'color' => $bookmarkData['color'],
            'allow_comments' => $bookmarkData['allow_comments'],
            'visibility' => $bookmarkData['visibility'],
            'status' => $bookmarkData['status'],
            'type' => 'voter_list',
            'type_id' => $validated['fund_slug'],
        ]);



        // Store collection ID in session
        $bookmarkData['collection_id'] = $bookmarkCollection->getRawOriginal('id');

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
        ]);

        $draftData = session()->get('voter_list_draft');

        // Get the proposal models from the slugs
        $proposalSlugs = $validated['proposals'];
        $proposals = Proposal::whereIn('slug', $proposalSlugs)->get();

        // Store proposal IDs in session for later reference
        session()->put('voter_list_draft.proposals', $proposals->pluck('id')->toArray());

        // Retrieve the bookmark collection using the ID stored in the session
        if (!empty($draftData['collection_id'])) {
            $bookmarkCollection = BookmarkCollection::find($draftData['collection_id']);



            if ($bookmarkCollection) {
                // First, clear existing items to prevent duplicates if user goes back and forth
                $rawId = $bookmarkCollection->getRawOriginal('id');
                DB::table('bookmark_items')
                    ->where('bookmark_collection_id', operator: $rawId)
                    ->update(['deleted_at' => now()]);

                // Then add the selected proposals to the bookmark collection
                foreach ($proposals as $proposal) {
                    DB::table('bookmark_items')->insert([
                        'user_id' => $request->user()->id,
                        'model_type' => Proposal::class,
                        'model_id' => $proposal->id,
                        'bookmark_collection_id' => $bookmarkCollection->getRawOriginal('id'),
                        'content' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        return to_route('workflows.createVoterList.index', ['step' => 4]);
    }

    public function saveRationales(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rationales' => 'required|array',
            'criteria' => 'required|string',
        ]);

        session()->put('voter_list_draft.rationales', $validated['rationales']);
        session()->put('voter_list_draft.criteria', $validated['criteria']);

        return to_route('workflows.createVoterList.index', ['step' => 5]);
    }

    public function finalizeVoterList(Request $request): RedirectResponse
    {
        $draftData = session()->get('voter_list_draft');

        // Create bookmark collection instead of voter list
        $bookmarkCollection = BookmarkCollection::create([
            'user_id' => $request->user()->id,
            'title' => $draftData['title'],
            'content' => $draftData['content'] ?? null,
            'color' => $draftData['color'] ?? '#2596BE',
            'allow_comments' => $draftData['allow_comments'] ?? null,
            'visibility' => $draftData['visibility'],
            'status' => $draftData['status'] ?? BookmarkStatus::DRAFT()->value,
            'type' => 'voter_list', // Custom type to identify this as a voter list
            'type_id' => $draftData['fund_slug'], // Store fund ID in the type_id field
        ]);

        // Add proposals as bookmark items
        if (!empty($draftData['proposals'])) {
            foreach ($draftData['proposals'] as $proposalId) {
                $bookmarkCollection->items()->create([
                    'user_id' => $request->user()->id,
                    'model_type' => Proposal::class,
                    'model_id' => $proposalId,
                    'content' => $draftData['rationales'][$proposalId] ?? null, // Store rationale as content
                ]);
            }
        }

        // Clear the draft data
        session()->forget('voter_list_draft');

        return to_route('bookmarks.index');
    }

    public function getStepDetails(): Collection
    {
        return collect([
            [
                'title' => 'Details',
            ],
            [
                'title' => 'List Detail',
            ],
            [
                'title' => 'Proposals',
            ],
            [
                'title' => 'Add Rationales',
            ],
            [
                'title' => 'Review & Publish',
            ],
        ]);
    }
}
