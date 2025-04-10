<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\DataTransferObjects\ProposalData;
use App\Enums\ProposalSearchParams;
use App\Enums\QueryParamsEnum;
use App\Models\Fund;
use App\Models\Proposal;
use App\Models\Signatures;
use App\Repositories\ProposalRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;
use ReflectionMethod;

class VotingWorkflowController extends Controller
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
        $this->setCorrectNextStep($request, 1);

        return Inertia::render('Workflows/SubmitVotes/Step1', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'proposals' => $this->getProposals($request),
            'selectedProposals' => $request->session()->get('selected_proposals', []),
            'votes' => $request->session()->get('votes', []),
            'filters' => $this->getFilters($request),
        ]);
    }

    public function step2(Request $request): Response
    {
        $this->setCorrectNextStep($request, 2);
        $selectedProposalSlugs = $request->session()->get('selected_proposals', []);
        $votes = $request->session()->get('votes', []);
        $proposalData = $request->session()->get('proposal_data', []); // Get stored proposal data

        $page = (int) $request->input(ProposalSearchParams::PAGE()->value, 1);
        $limit = (int) $request->input('limit', 5);

        // If we have stored proposal data, use it
        if (! empty($proposalData)) {
            $paginatedProposals = $this->paginateArray(
                $proposalData,
                $limit,
                $page,
                [
                    'pageName' => 'p',
                    'path' => $request->url(),
                ]
            );
        } else {
            // Fall back to the existing method if no stored data
            $selectedProposals = $this->getSelectedProposals($selectedProposalSlugs, $votes);
            $paginatedProposals = $this->paginateArray(
                $selectedProposals,
                $limit,
                $page,
                [
                    'pageName' => 'p',
                    'path' => $request->url(),
                ]
            );
        }

        return Inertia::render('Workflows/SubmitVotes/Step2', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'selectedProposals' => $paginatedProposals,
            'votes' => $votes,
            'filters' => $this->getFilters($request),
        ]);
    }

    public function step3(Request $request): Response
    {
        $this->setCorrectNextStep($request, 3);

        return Inertia::render('Workflows/SubmitVotes/Step3', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
        ]);
    }

    public function step4(Request $request): Response
    {
        $this->setCorrectNextStep($request, 4);
        $wallet = $request->session()->get('wallet', null);

        $selectedProposalSlugs = $request->session()->get('selected_proposals', []);
        $votes = $request->session()->get('votes', []);
        $proposalData = $request->session()->get('proposal_data', []);
        Log::info('Saving Voting Decisions in step 4', [
            'proposalData' => $validated['proposalData'] ?? [],
        ]);

        return Inertia::render('Workflows/SubmitVotes/Step4', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'wallet' => $wallet,
        ]);
    }

    public function step5(Request $request): Response
    {
        $this->setCorrectNextStep($request, 5);
        $selectedProposalSlugs = $request->session()->get('selected_proposals', []);
        $votes = $request->session()->get('votes', []);

        $proposals = $this->getProposalsWithSubmissionStatus($selectedProposalSlugs, $votes);

        $page = (int) $request->input(ProposalSearchParams::PAGE()->value, 1);
        $limit = (int) $request->input('limit', 5);

        $paginatedProposals = $this->paginateArray(
            $proposals,
            $limit,
            $page,
            [
                'pageName' => 'p',
                'path' => $request->url(),
            ]
        );

        return Inertia::render('Workflows/SubmitVotes/Step5', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => intval($request->step),
            'proposals' => $paginatedProposals,
            'filters' => $this->getFilters($request),
            'votes' => $votes,
        ]);
    }

    public function step6(Request $request): Response
    {
        return Inertia::render('Workflows/SubmitVotes/Success', [
            'stepDetails' => $this->getStepDetails(),
            'activeStep' => 6,
        ]);
    }

    private function setCorrectNextStep(Request $request, int $step): void
    {
        $nextStep = $step + 1;
        if ($nextStep > 6) {
            $nextStep = 6;
        }

        $request->session()->put('nextstep', [
            'route' => 'workflows.voting.index',
            'param' => [
                'step' => (string) $nextStep,
            ],
        ]);
    }

    public function success(Request $request): Response
    {
        return Inertia::render('Workflows/SubmitVotes/Success');
    }

    public function saveVotingDecisions(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'proposals' => 'array',
            'votes' => 'array',
            'proposalData' => 'array',
        ]);
        Log::info('Saving Voting Decisions - Detailed', [
            'proposals_count' => count($validated['proposals'] ?? []),
            'votes_count' => count($validated['votes'] ?? []),
            'proposalData_count' => count($validated['proposalData'] ?? []),
            'proposals' => $validated['proposals'] ?? [],
            'votes' => $validated['votes'] ?? [],
            'first_proposal' => $validated['proposalData'][0] ?? null,
        ]);
        $request->session()->put('selected_proposals', $validated['proposals'] ?? []);
        $request->session()->put('votes', $validated['votes'] ?? []);
        $request->session()->put('proposal_data', $validated['proposalData'] ?? []);

        return to_route('workflows.voting.index', [
            'step' => 2,
        ]);
    }

    public function signBallot(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'wallet' => 'required|string',
            'walletAddress' => 'nullable|string',
            'network' => 'nullable|string',
            'networkId' => 'nullable|string',
            'stake_key' => 'nullable|string',
        ]);

        $request->session()->put('wallet', $validated['wallet']);
        $request->session()->put('wallet_data', $validated);

        return to_route('workflows.voting.index', [
            'step' => 4,
        ]);
    }

    public function submitVotes(Request $request): RedirectResponse
    {
        $selectedProposals = $request->session()->get('selected_proposals', []);
        $votes = $request->session()->get('votes', []);
        $wallet = $request->session()->get('wallet', null);
        $walletData = $request->session()->get('wallet_data', []);

        foreach ($request->only([
            'walletName', 'walletAddress', 'walletProvider',
            'balance', 'network', 'chainId', 'timestamp', 'stake_key',
        ]) as $key => $value) {
            if ($value) {
                $walletData[$key] = $value;
            }
        }

        $request->session()->put('wallet_data', $walletData);

        if (empty($selectedProposals) || empty($votes) || empty($wallet)) {
            return back()->withErrors(['message' => 'Missing required data for vote submission.']);
        }
        try {
            Signatures::create([
                'stake_key' => $walletData['stake_key'] ?? '',
                'signature' => $walletData['signature'] ?? '',
                'signature_key' => $walletData['signature_key'] ?? '',
                'wallet_provider' => $wallet,
            ]);

        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Error saving signature. Please try again.']);
        }
        $request->session()->put('nextstep', [
            'route' => 'en.workflows.voting.index',
            'param' => [
                'step' => '5',
            ],
        ]);

        return to_route('workflows.voting.index', [
            'step' => 5,
        ]);
    }

    private function getProposals(Request $request): array|LengthAwarePaginator
    {
        $fundSlug = $request->input(QueryParamsEnum::FUNDS()->value);

        $fund = null;
        if ($fundSlug) {
            $fund = Fund::where('slug', $fundSlug)->first();
        } else {
            $fund = Fund::orderBy('created_at', 'desc')->first();
            $fundSlug = $fund ? $fund->slug : null;
        }

        if (! $fund) {
            return [];
        }

        $page = $request->input(ProposalSearchParams::PAGE()->value, default: 1);
        $limit = $request->input('limit', 10);
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

        return new LengthAwarePaginator(
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

    private function getSelectedProposals(array $slugs, array $votes): array
    {
        $dbProposals = Proposal::whereIn('slug', $slugs)
            ->with('fund')
            ->get();
        $dbProposalsMap = $dbProposals->keyBy('slug')->toArray();

        $result = [];

        foreach ($slugs as $slug) {
            if (isset($dbProposalsMap[$slug])) {
                $proposal = $dbProposalsMap[$slug];
                $result[] = [
                    'slug' => $proposal['slug'],
                    'title' => $proposal['title'],
                    'fund' => [
                        'title' => $proposal['fund']['title'] ?? 'Unknown Fund',
                    ],
                    'budget' => $proposal['budget'] ?? $proposal['amount_requested'] ?? '75K ADA',
                    'requested_funds' => $proposal['amount_requested'] ?? '75K ADA',
                    'vote' => $votes[$slug] ?? null,
                    'exists' => true,
                ];
            } else {
                $humanReadableTitle = ucwords(str_replace('-', ' ', $slug));

                $result[] = [
                    'slug' => $slug,
                    'title' => $humanReadableTitle,
                    'fund' => [
                        'title' => 'Unknown Fund',
                    ],
                    'requested_funds' => '75K ADA',
                    'vote' => $votes[$slug] ?? null,
                    'exists' => false,
                ];
            }
        }

        foreach ($votes as $slug => $vote) {
            if (! in_array($slug, $slugs)) {
                $humanReadableTitle = ucwords(str_replace('-', ' ', $slug));

                $result[] = [
                    'slug' => $slug,
                    'title' => $humanReadableTitle,
                    'fund' => [
                        'title' => 'Unknown Fund',
                    ],
                    'requested_funds' => '75K ADA',
                    'vote' => $vote,
                    'exists' => false,
                ];
            }
        }

        return $result;
    }

    private function getProposalsWithSubmissionStatus(array $slugs, array $votes): array
    {
        if (empty($slugs)) {
            return [];
        }

        $existingProposals = Proposal::whereIn('slug', $slugs)
            ->with('fund')
            ->get()
            ->keyBy('slug');

        $proposals = [];
        $isFirstProposal = true;

        foreach ($slugs as $slug) {
            $proposal = $existingProposals->get($slug);

            $proposalData = [
                'slug' => $slug,
                'title' => $proposal ? $proposal->title : $slug,
                'fund' => $proposal && $proposal->fund ? $proposal->fund->title : 'Unknown Fund',
                'requested_funds' => $proposal ? ($proposal->amount_requested ?? '75K ADA') : '75K ADA',
                'status' => $isFirstProposal ? 'submitted' : 'submitting',
                'vote' => $votes[$slug] ?? null,
            ];

            $proposals[] = $proposalData;
            $isFirstProposal = false;
        }

        return $proposals;
    }

    private function getFilters(Request $request): array
    {
        $fundSlug = $request->input(QueryParamsEnum::FUNDS()->value);
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

        $filters[ProposalSearchParams::PAGE()->value] = $request->input(ProposalSearchParams::PAGE()->value, 1);

        return $filters;
    }

    private function paginateArray(array $items, int $perPage = 15, int $page = 1, array $options = []): LengthAwarePaginator
    {
        $page = $page ?: (isset($options['pageName']) ? request()->input($options['pageName'], 1) : 1);

        $items = collect($items);

        return new LengthAwarePaginator(
            $items->forPage($page, $perPage)->values(),
            $items->count(),
            $perPage,
            $page,
            $options
        );
    }

    private function getStepDetails(): Collection
    {
        return collect([
            [
                'title' => 'workflows.voting.steps.submitVotes',
                'info' => 'workflows.voting.steps.submitVotesInfo',
            ],
            [
                'title' => 'workflows.voting.steps.votesSummary',
                'info' => 'workflows.voting.steps.votesSummaryInfo',
            ],
            [
                'title' => 'workflows.voting.steps.connectWallet',
                'info' => 'workflows.voting.steps.connectWalletInfo',
            ],
            [
                'title' => 'workflows.voting.steps.submitVotes',
                'info' => 'workflows.voting.steps.submitReviewedVotesInfo',
            ],
            [
                'title' => 'workflows.voting.steps.submission',
                'info' => 'workflows.voting.steps.submissionInfo',
            ],
            [
                'title' => 'workflows.voting.success.title',
                'info' => 'workflows.voting.success.successInfo',
            ],
        ]);
    }
}
