<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\FundData;
use App\DataTransferObjects\ProposalData;
use App\DataTransferObjects\ReviewData;
use App\Enums\ProposalSearchParams;
use App\Http\Requests\UpdateProposalQuickPitchRequest;
use App\Models\Connection;
use App\Models\Fund;
use App\Models\IdeascaleProfile;
use App\Models\Metric;
use App\Models\Proposal;
use App\Repositories\ProposalRepository;
use App\Services\VideoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Fluent;
use Illuminate\Support\Stringable;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Scout\Builder;
use Symfony\Component\HttpFoundation\Request as SymfonyRequest;

class ProposalsController extends Controller
{
    protected int $currentPage = 1;

    protected int $limit = 32;

    protected array $queryParams = [];

    protected ?string $sortBy = 'created_at';

    protected ?string $sortOrder = 'desc';

    protected null|string|Stringable $search = null;

    public array $tagsCount = [];

    public array $fundsCount = [];

    public array $cohortData = [];

    public array $challengesCount = [];

    public int $submittedProposals = 0;

    public int $approvedProposals = 0;

    public int $completedProposals = 0;

    public int $sumBudgetsADA = 0;

    public int $sumBudgetsUSD = 0;

    public int $sumApprovedADA = 0;

    public int $sumApprovedUSD = 0;

    public int $sumDistributedADA = 0;

    public int $sumDistributedUSD = 0;

    public int $sumCompletedUSD = 0;

    public function index(Request $request)
    {
        $this->getProps($request);

        // dont touch for now
        $proposal = $this->query();

        return Inertia::render(
            'Proposals/Index',
            [
                'proposals' => app()->environment('testing')
                    ? $proposal
                    : Inertia::optional(callback: fn () => $proposal),
                'filters' => $this->queryParams,
                'funds' => $this->fundsCount,
                'search' => $this->search,
                'sort' => "{$this->sortBy}:{$this->sortOrder}",
                'metrics' => [
                    'submitted' => $this->submittedProposals,
                    'approved' => $this->approvedProposals,
                    'completed' => $this->completedProposals,
                    'requestedUSD' => $this->sumBudgetsUSD,
                    'requestedADA' => $this->sumBudgetsADA,
                    'awardedUSD' => $this->sumApprovedUSD,
                    'awardedADA' => $this->sumApprovedADA,
                    'distributedUSD' => $this->sumDistributedUSD,
                    'distributedADA' => $this->sumDistributedADA,
                ],
            ]
        );
    }

    public function proposal(Request $request, $slug): Response
    {
        $proposal = Proposal::where('slug', $slug)->firstOrFail();

        $this->getProps($request);

        $proposalId = $proposal->id;

        $cacheKey = "proposal:{$proposalId}:base_data";

        $proposalData = Cache::remember($cacheKey, now()->addMinutes(0), function () use ($proposal) {
            $proposal->load([
                'fund',
                'groups',
                'team',
                'users',
                //                'team.proposals',
                //                'reviews',
                'author',
            ]);

            $data = $proposal->toArray();

            $data['alignment_score'] = $proposal->getDiscussionRankingScore('Impact Alignment') ?? 0;
            $data['feasibility_score'] = $proposal->getDiscussionRankingScore('Feasibility') ?? 0;
            $data['auditability_score'] = $proposal->getDiscussionRankingScore('Value for money') ?? 0;

            try {
                $ideascaleProfiles = $proposal->ideascaleProfiles;
                $ideascaleProfileIds = $ideascaleProfiles ? $ideascaleProfiles->pluck('id')->toArray() : [];
                $counts = $this->getCounts($ideascaleProfileIds);

                $data['users'] = $ideascaleProfiles ? $ideascaleProfiles->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'ideascale_id' => $u->ideascale_id,
                        'username' => $u->username,
                        'name' => $u->name,
                        'bio' => $u->bio,
                        'hero_img_url' => $u->hero_img_url,
                        'proposals_completed' => 0, // Disable for now
                        'first_timer' => false, // Disable for now
                    ];
                })->toArray() : [];
            } catch (\Exception $e) {
                $counts = ['userCompleteProposalsCount' => 0, 'userOutstandingProposalsCount' => 0, 'catalystConnectionCount' => 0];
                $data['users'] = [];
            }

            return [
                ...$data,
                'groups' => $proposal->groups ? $proposal->groups->toArray() : [],
                'userCompleteProposalsCount' => $counts['userCompleteProposalsCount'] ?? 0,
                'userOutstandingProposalsCount' => $counts['userOutstandingProposalsCount'] ?? 0,
                'catalystConnectionsCount' => $counts['catalystConnectionCount'] ?? 0,
            ];
        });

        $currentPage = 1;

        $teamConnections = $this->generateTeamNetworkData($proposal);

        $props = [
            'proposal' => ProposalData::from($proposal),
            'proposals' => Inertia::optional(
                fn () => Cache::remember(
                    "proposal:{$proposalId}:proposals:page:{$currentPage}",
                    now()->addMinutes(10),
                    fn () => to_length_aware_paginator(
                        ProposalData::collect($proposal)
                    )->onEachSide(0)
                )
            ),
            'reviews' => Inertia::optional(
                fn () => Cache::remember(
                    "proposal:{$proposalId}:reviews:page:{$currentPage}",
                    now()->addMinutes(10),
                    function () use ($proposal) {
                        try {
                            $reviews = $proposal->reviews;
                            if (empty($reviews) || $reviews->count() === 0) {
                                return to_length_aware_paginator(
                                    collect([])
                                )->onEachSide(0);
                            }

                            // Convert reviews to proper format for ReviewData
                            $reviewsData = $reviews->map(function ($review) {
                                return [
                                    'hash' => $review->id, // Use UUID as hash
                                    'parent_id' => $review->parent_id,
                                    'title' => $review->title,
                                    'content' => $review->content,
                                    'status' => $review->status ?? 'published',
                                    'rating' => null, // TODO: implement rating relationship
                                    'proposal' => null,
                                    'reviewer' => null, // TODO: implement reviewer relationship
                                    'ranking_total' => $review->ranking_total ?? 0,
                                    'positive_rankings' => $review->positive_rankings ?? 0,
                                    'negative_rankings' => $review->negative_rankings ?? 0,
                                ];
                            });

                            return to_length_aware_paginator(
                                ReviewData::collect($reviewsData)
                            )->onEachSide(0);
                        } catch (\Exception $e) {
                            \Log::error('Error loading reviews for proposal: '.$e->getMessage());

                            return to_length_aware_paginator(
                                collect([])
                            )->onEachSide(0);
                        }
                    }
                )
            ),
            'aggregatedRatings' => Cache::remember(
                "proposal:{$proposalId}:aggregated_ratings",
                now()->addMinutes(10),
                fn () => $proposalData['aggregated_ratings'] ?? []
            ),
            'connections' => $teamConnections,
            'userCompleteProposalsCount' => $proposalData['userCompleteProposalsCount'] ?? 0,
            'userOutstandingProposalsCount' => $proposalData['userOutstandingProposalsCount'] ?? 0,
            'catalystConnectionsCount' => $proposalData['catalystConnectionsCount'] ?? 0,
        ];

        return match (true) {
            str_contains($request->path(), '/details') => Inertia::render('Proposals/Details/Index', $props),
            str_contains($request->path(), '/schedule') => Inertia::render('Proposals/Schedule/Index', $props),
            str_contains($request->path(), '/community-review') => Inertia::render('Proposals/CommunityReview/Index', $props),
            str_contains($request->path(), '/team-information') => Inertia::render('Proposals/TeamInformation/Index', $props),
            default => Inertia::render('Proposals/Details/Index', $props),
        };
    }

    public function proposalSchedule(Request $request, $slug)
    {
        $proposal = Proposal::with(['schedule.milestones'])
            ->where('slug', $slug)->firstOrFail();

        return Inertia::render(
            'Proposals/Schedule/Index',
            [
                'proposal' => $this->getProposalBaseData($request, $proposal),
            ]
        );
    }

    public function myProposals(Request $request): Response
    {
        $user = Auth::user();

        $user->loadCount('claimed_catalyst_profiles', 'claimed_ideascale_profiles');

        // Get profile counts for summary
        $catalystCount = $user->claimed_catalyst_profiles_count;
        $ideascaleCount = $user->claimed_ideascale_profiles_count;
        $totalProfiles = $catalystCount + $ideascaleCount;

        if ($totalProfiles === 0) {
            return Inertia::render('My/Proposals/Index', [
                'proposals' => [
                    'data' => [],
                    'current_page' => 1,
                    'per_page' => 12,
                    'total' => 0,
                    'last_page' => 1,
                ],
                'profileSummary' => [
                    'total_profiles' => 0,
                    'catalyst_profiles' => 0,
                    'ideascale_profiles' => 0,
                    'message' => 'No profiles claimed yet. Claim profiles to see associated proposals.',
                ],
            ]);
        }

        $perPage = min($request->get('per_page', 12), 60); // Max 60 per page
        $page = $request->get('page', 1);

        $proposalsQuery = $user->proposals()
            ->with([
                'fund',
                'campaign',
                'catalyst_profiles',
                'ideascale_profiles',
            ])
            ->orderBy('created_at', 'desc');

        if ($search = $request->get('search')) {
            $proposalsQuery->where(function ($query) use ($search) {
                $query->where('title', 'ilike', "%{$search}%")
                    ->orWhere('problem', 'ilike', "%{$search}%")
                    ->orWhere('solution', 'ilike', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $proposalsQuery->where('status', $status);
        }

        if ($fundId = $request->get('fund_id')) {
            $proposalsQuery->where('fund_id', $fundId);
        }

        $proposals = $proposalsQuery->paginate($perPage, ['*'], 'page', $page);

        $proposalData = [
            'data' => ProposalData::collect($proposals->items()),
            'current_page' => $proposals->currentPage(),
            'per_page' => $proposals->perPage(),
            'total' => $proposals->total(),
            'last_page' => $proposals->lastPage(),
        ];

        return Inertia::render('My/Proposals/Index', [
            'proposals' => $proposalData,
            'profileSummary' => [
                'total_profiles' => $totalProfiles,
                'catalyst_profiles' => $catalystCount,
                'ideascale_profiles' => $ideascaleCount,
                'message' => 'Showing proposals from all your claimed profiles using direct Eloquent queries.',
            ],
            'filters' => [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'fund_id' => $request->get('fund_id', ''),
                'per_page' => $perPage,
            ],
        ]);
    }

    public function manageProposal(Request $request, Proposal $proposal): Response
    {
        Gate::authorize('manage', $proposal);

        return Inertia::render('My/Proposals/ManageProposal', [
            'proposal' => ProposalData::from($proposal),
        ]);
    }

    public function updateQuickPitch(UpdateProposalQuickPitchRequest $request, Proposal $proposal): RedirectResponse
    {
        Gate::authorize('manage', $proposal);

        $url = $request->validated()['quickpitch'];

        try {
            // Normalize YouTube URLs to youtu.be format
            $normalizedUrl = app(VideoService::class)->normalizeYouTubeUrl($url);

            // Try to get video metadata for duration
            $duration = null;
            try {
                $metadata = app(VideoService::class)->getVideoMetadata($normalizedUrl);
                $duration = $metadata['duration'] ?? null;
            } catch (\Exception $e) {
                Log::warning('Failed to fetch video metadata for proposal quick pitch', [
                    'proposal_id' => $proposal->id,
                    'url' => $normalizedUrl,
                    'error' => $e->getMessage(),
                ]);
                // Continue without duration - we don't want to fail the entire update
            }

            // Update the proposal
            $proposal->update([
                'quickpitch' => $normalizedUrl,
                'quickpitch_length' => $duration,
            ]);

            return redirect()->back()->with('success', 'Quick pitch updated successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update proposal quick pitch', [
                'proposal_id' => $proposal->id,
                'url' => $url,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->withErrors([
                'quickpitch' => 'Failed to update quick pitch. Please try again.',
            ]);
        }
    }

    public function charts(Request $request): Response
    {
        $referer = $request->headers->get('referer');
        $refererParams = [];

        if ($referer) {
            $parsedUrl = parse_url($referer);
            if (isset($parsedUrl['query'])) {
                $refererParams = SymfonyRequest::create('?'.$parsedUrl['query'])->query->all();
            }
        }

        $allParams = array_merge($refererParams, $request->all());
        $mergedRequest = $request->duplicate($allParams);
        $this->getProps($mergedRequest);

        $rules = Metric::where('context', 'charts')
            ->with('rules')
            ->get()
            ->pluck('rules')
            ->flatten()
            ->pluck('title')
            ->unique()
            ->values();

        return Inertia::render(
            'Charts/Index',
            [
                'filters' => $this->queryParams,
                'rules' => $rules,
            ]
        );
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            ProposalSearchParams::FUNDING_STATUS()->value => 'array|nullable',
            ProposalSearchParams::OPENSOURCE_PROPOSALS()->value => 'bool|nullable',
            ProposalSearchParams::PROJECT_LENGTH()->value => 'array|nullable',
            ProposalSearchParams::PROJECT_STATUS()->value => 'array|nullable',
            ProposalSearchParams::QUERY()->value => 'string|nullable',
            ProposalSearchParams::COHORT()->value => 'array|nullable',
            ProposalSearchParams::QUICK_PITCHES()->value => 'bool|nullable',
            ProposalSearchParams::TYPE()->value => 'string|nullable',
            ProposalSearchParams::PAGE()->value => 'int|nullable',
            ProposalSearchParams::LIMIT()->value => 'int|nullable',
            ProposalSearchParams::SORTS()->value => 'nullable',
            ProposalSearchParams::BUDGETS()->value => 'array|nullable',
            ProposalSearchParams::MIN_BUDGET()->value => 'int|nullable',
            ProposalSearchParams::MAX_BUDGET()->value => 'int|nullable',
            ProposalSearchParams::MIN_PROJECT_LENGTH()->value => 'int|nullable',
            ProposalSearchParams::MAX_PROJECT_LENGTH()->value => 'int|nullable',
            ProposalSearchParams::CAMPAIGNS()->value => 'array|nullable',
            ProposalSearchParams::TAGS()->value => 'array|nullable',
            ProposalSearchParams::GROUPS()->value => 'array|nullable',
            ProposalSearchParams::COMMUNITIES()->value => 'array|nullable',
            ProposalSearchParams::CATALYST_PROFILES()->value => 'array|nullable',
            ProposalSearchParams::IDEASCALE_PROFILES()->value => 'array|nullable',
            ProposalSearchParams::FUNDS()->value => 'array|nullable',
            ProposalSearchParams::CHART_TYPE()->value => 'string|nullable',
            ProposalSearchParams::SUBMITTED_PROPOSALS()->value => 'array|nullable',
            ProposalSearchParams::APPROVED_PROPOSALS()->value => 'array|nullable',
            ProposalSearchParams::COMPLETED_PROPOSALS()->value => 'array|nullable',
            ProposalSearchParams::UNFUNDED_PROPOSALS()->value => 'array|nullable',
            ProposalSearchParams::IN_PROGRESS_PROPOSALS()->value => 'array|nullable',
        ]);

        // format sort params for meili
        if (! empty($this->queryParams[ProposalSearchParams::SORTS()->value])) {
            $sort = collect(
                explode(
                    ':',
                    $this->queryParams[ProposalSearchParams::SORTS()->value]
                )
            )->filter();

            $this->sortBy = $sort->first();

            $this->sortOrder = $sort->last();
        }
    }

    protected function query($returnBuilder = false, $attrs = null, $filters = []): array|Builder
    {
        $args = [
            'filter' => $this->getUserFilters(),
        ];

        if ((bool) $this->sortBy && (bool) $this->sortOrder) {
            $args['sort'] = ["$this->sortBy:$this->sortOrder"];
        }

        $page = isset($this->queryParams[ProposalSearchParams::PAGE()->value])
            ? (int) $this->queryParams[ProposalSearchParams::PAGE()->value]
            : 1;

        $limit = isset($this->queryParams[ProposalSearchParams::LIMIT()->value])
            ? (int) $this->queryParams[ProposalSearchParams::LIMIT()->value]
            : 32;

        $args['offset'] = ($page - 1) * $limit;
        $args['limit'] = $limit;

        $proposals = app(ProposalRepository::class);

        $builder = $proposals->search(
            $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '',
            $args
        );

        $response = new Fluent($builder->raw());

        $items = collect($response->hits);

        $this->setCounts($response->facetDistribution, $response->facetStats);

        // Safely collect proposal data with error handling for malformed campaign data
        try {
            $proposalCollection = ProposalData::collect($items);
        } catch (\TypeError $e) {
            // Log the error and filter out problematic items
            Log::warning('ProposalData collection failed, filtering problematic items', [
                'error' => $e->getMessage(),
                'items_count' => $items->count(),
            ]);

            // Filter out items that cause issues and try again
            $filteredItems = $items->map(function ($item) {
                // Ensure campaign data is safe
                if (isset($item['campaign']) && is_array($item['campaign'])) {
                    // If campaign ID is null and no essential data, remove campaign
                    if (empty($item['campaign']['id']) && empty($item['campaign']['title']) && empty($item['campaign']['slug'])) {
                        $item['campaign'] = null;
                    } else {
                        // Ensure ID is string or null
                        $item['campaign']['id'] = $item['campaign']['id'] ? (string) $item['campaign']['id'] : null;
                    }
                }

                return $item;
            });

            try {
                $proposalCollection = ProposalData::collect($filteredItems);
            } catch (\TypeError $e2) {
                // Final fallback: return empty collection
                Log::error('ProposalData collection failed even after filtering', [
                    'error' => $e2->getMessage(),
                ]);
                $proposalCollection = collect([]);
            }
        }

        $pagination = new LengthAwarePaginator(
            $proposalCollection,
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

    protected function getUserFilters(): array
    {
        $filters = [];

        if (isset($this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value])) {
            $fundingStatuses = implode(',', $this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value]);
            $filters[] = "funding_status IN [{$fundingStatuses}]";
        }

        if (isset($this->queryParams[ProposalSearchParams::PROJECT_STATUS()->value])) {
            $projectStatuses = implode(',', $this->queryParams[ProposalSearchParams::PROJECT_STATUS()->value]);
            $filters[] = "status IN [{$projectStatuses}]";
        }

        if (isset($this->queryParams[ProposalSearchParams::OPENSOURCE_PROPOSALS()->value])) {
            $filters[] = 'opensource='.match ($this->queryParams[ProposalSearchParams::OPENSOURCE_PROPOSALS()->value]) {
                '0' => 'false',
                '1' => 'true'
            };
        }

        $filters[] = 'type='.($this->queryParams[ProposalSearchParams::TYPE()->value] ?? 'proposal');

        if (isset($this->queryParams[ProposalSearchParams::QUICK_PITCHES()->value])) {
            $filters[] = 'quickpitch IS NOT NULL';
        }

        // filter by budget range
        if (! empty($this->queryParams[ProposalSearchParams::BUDGETS()->value])) {
            $budgetRange = collect((object) $this->queryParams[ProposalSearchParams::BUDGETS()->value]);
            $filters[] = "(amount_requested  {$budgetRange->first()} TO  {$budgetRange->last()})";
        }

        // filter by challenge
        if (! empty($this->queryParams[ProposalSearchParams::CAMPAIGNS()->value])) {
            $campaignIds = ($this->queryParams[ProposalSearchParams::CAMPAIGNS()->value]);
            $filters[] = '('.implode(' OR ', array_map(fn ($c) => "campaign.id = {$c}", $campaignIds)).')';
        }

        if (! empty($this->queryParams[ProposalSearchParams::TAGS()->value])) {
            $tagIds = ($this->queryParams[ProposalSearchParams::TAGS()->value]);
            $filters[] = '('.implode(' OR ', array_map(fn ($c) => "tags.id = {$c}", $tagIds)).')';
        }

        if (! empty($this->queryParams[ProposalSearchParams::IDEASCALE_PROFILES()->value])) {
            $ideascaleProfileIds = implode(',', $this->queryParams[ProposalSearchParams::IDEASCALE_PROFILES()->value]);
            $filters[] = "users.id IN [{$ideascaleProfileIds}]";
        }

        if (! empty($this->queryParams[ProposalSearchParams::CATALYST_PROFILES()->value])) {
            $catalystProfileIds = implode(',', $this->queryParams[ProposalSearchParams::CATALYST_PROFILES()->value]);
            $filters[] = "claimed_catalyst_profiles.id IN [{$catalystProfileIds}]";
        }

        if (! empty($this->queryParams[ProposalSearchParams::GROUPS()->value])) {
            $groupIds = implode(',', $this->queryParams[ProposalSearchParams::GROUPS()->value]);
            $filters[] = "groups.id IN [{$groupIds}]";
        }

        if (! empty($this->queryParams[ProposalSearchParams::COMMUNITIES()->value])) {
            $communityHashes = implode(',', $this->queryParams[ProposalSearchParams::COMMUNITIES()->value]);
            $filters[] = "communities.id IN [{$communityHashes}]";
        }

        if (! empty($this->queryParams[ProposalSearchParams::PROJECT_LENGTH()->value])) {
            $projectLength = collect((object) $this->queryParams[ProposalSearchParams::PROJECT_LENGTH()->value]);
            $filters[] = "(project_length  {$projectLength->first()} TO  {$projectLength->last()})";
        }

        if (! empty($this->queryParams[ProposalSearchParams::COHORT()->value])) {
            $cohortFilters = array_map(fn ($cohort) => "{$cohort} = 1", $this->queryParams[ProposalSearchParams::COHORT()->value]);
            $filters[] = '('.implode(' OR ', $cohortFilters).')';
        }

        if (! empty($this->queryParams[ProposalSearchParams::FUNDS()->value])) {
            $fundIds = (array) $this->queryParams[ProposalSearchParams::FUNDS()->value];
            $funds = implode("','", $fundIds);
            $filters[] = "fund.id IN ['{$funds}']";
        }

        return $filters;
    }

    public function setCounts($facets, $facetStats): void
    {

        if (isset($facets['amount_awarded_USD'])) {
            foreach ($facets['amount_awarded_USD'] as $key => $value) {
                $this->sumApprovedUSD += intval($key * $value);
            }
        }

        if (isset($facets['amount_awarded_ADA'])) {
            foreach ($facets['amount_awarded_ADA'] as $key => $value) {
                $this->sumApprovedADA += intval($key * $value);
            }
        }

        if (isset($facets['amount_received_ADA'])) {
            foreach ($facets['amount_received_ADA'] as $key => $value) {
                $this->sumDistributedADA += intval($key * $value);
            }
        }

        if (isset($facets['amount_received_USD'])) {
            foreach ($facets['amount_received_USD'] as $key => $value) {
                $this->sumDistributedUSD += intval($key * $value);
            }
        }

        if (isset($facets['amount_requested_ADA'])) {
            foreach ($facets['amount_requested_ADA'] as $key => $value) {
                $this->sumBudgetsADA += intval($key * $value);
            }
        }

        if (isset($facets['amount_requested_USD'])) {
            foreach ($facets['amount_requested_USD'] as $key => $value) {
                $this->sumBudgetsUSD += intval($key * $value);
            }
        }

        if (isset($facets['status']['complete'])) {
            $this->completedProposals = $facets['status']['complete'];
        }

        if (isset($facets['status'])) {
            foreach ($facets['status'] as $key => $value) {
                $this->submittedProposals += $value;
            }
        }

        if (isset($facets['funding_status']['funded']) || isset($facets['funding_status']['leftover'])) {
            $this->approvedProposals = ($facets['funding_status']['funded'] ?? 0) + ($facets['funding_status']['leftover'] ?? 0);
        }

        if (isset($facets['funding_status']['leftover'])) {
            $this->approvedProposals = $this->approvedProposals + $facets['funding_status']['leftover'];
        }

        if (isset($facets['campaign.title']) && count($facets['campaign.title'])) {
            $this->challengesCount = $facets['campaign.title'];
        }

        if (isset($facets['tags.id']) && count($facets['tags.id'])) {
            $this->tagsCount = $facets['tags.id'];
        }

        if (isset($facets['fund.title']) && count($facets['fund.title'])) {
            $this->fundsCount = $facets['fund.title'];
        }

        // if (isset($facetStats['amount_requested'])) {
        //     $this->budgets = collect(array_values($facetStats['amount_requested']));
        // }

        // if (isset($facetStats['project_length'])) {
        //     $this->queryParams[ProposalSearchParams::PROJECT_LENGTH()->value] = collect(array_values($facetStats['project_length']));
        // }

        // if (isset($facetStats['amount_requested'])) {
        //     $this->queryParams[ProposalSearchParams::MAX_BUDGET()->value] = $facetStats['amount_requested']['max'];
        //     $this->queryParams[ProposalSearchParams::MIN_BUDGET()->value] = $facetStats['amount_requested']['min'];
        //     $this->queryParams[ProposalSearchParams::BUDGETS()->value] = [$facetStats['amount_requested']['min'], $facetStats['amount_requested']['max']];
        // }

        if (isset($facets['woman_proposal'])) {
            $this->cohortData['woman_proposal'] = $facets['woman_proposal'];
        }

        if (isset($facets['opensource'])) {
            $this->cohortData['opensource'] = $facets['opensource'];
        }

        if (isset($facets['ideafest_proposal'])) {
            $this->cohortData['ideafest_proposal'] = $facets['ideafest_proposal'];
        }

        if (isset($facets['has_quick_pitch'])) {
            $this->cohortData['has_quick_pitch'] = $facets['has_quick_pitch'];
        }

        if (isset($facets['impact_proposal'])) {
            $this->cohortData['impact_proposal'] = $facets['impact_proposal'];
        }
    }

    public function fundTitles(Request $request)
    {
        $funds = Fund::all(['id', 'title']);

        $fundTitles = $funds->map(function ($fund) {
            return [
                'id' => $fund->id,
                'title' => $fund->title,
            ];
        });

        return response()->json($fundTitles);
    }

    public function funds(Request $request)
    {
        $funds = Fund::when($request->search, fn ($q, $search) => $q->where('title', 'ilike', "{$search}%"))->get();

        return FundData::collect($funds);
    }

    public function getCounts($ideascaleProfileIds)
    {
        if (empty($ideascaleProfileIds)) {
            return [
                'userCompleteProposalsCount' => 0,
                'userOutstandingProposalsCount' => 0,
                'catalystConnectionCount' => 0,
            ];
        }

        try {
            $userCompleteProposalsCount = Proposal::where('status', 'complete')
                ->whereHas('ideascaleProfiles', function ($query) use ($ideascaleProfileIds) {
                    $query->whereIn('ideascale_profiles.id', $ideascaleProfileIds);
                })
                ->count();

            $userOutstandingProposalsCount = Proposal::where('status', 'in_progress')
                ->whereHas('ideascaleProfiles', function ($query) use ($ideascaleProfileIds) {
                    $query->whereIn('ideascale_profiles.id', $ideascaleProfileIds);
                })
                ->count();

            $catalystConnectionCount = Connection::whereIn('previous_model_id', $ideascaleProfileIds)
                ->where('previous_model_type', IdeascaleProfile::class)
                ->distinct()
                ->count();

            return [
                'userCompleteProposalsCount' => $userCompleteProposalsCount,
                'userOutstandingProposalsCount' => $userOutstandingProposalsCount,
                'catalystConnectionCount' => $catalystConnectionCount,
            ];
        } catch (\Exception $e) {
            return [
                'userCompleteProposalsCount' => 0,
                'userOutstandingProposalsCount' => 0,
                'catalystConnectionCount' => 0,
            ];
        }
    }

    private function generateTeamNetworkData(Proposal $proposal): array
    {
        $author = $proposal->author;

        try {
            if (! $author) {
                $team = $proposal->team;
                $author = $team ? $team->first() : null;
            }
        } catch (\Exception $e) {
            \Log::error('Error loading team for network data: '.$e->getMessage());
            $author = null;
        }

        $teamConnections = [
            'nodes' => [],
            'links' => [],
            'rootNodeId' => $author ? $author->id : null,
            'rootNodeHash' => $author ? $author->hash : null,
            'rootNodeType' => $author ? get_class($author) : null,
        ];

        if (! $author) {
            return $teamConnections;
        }

        $teamConnections['nodes'][] = [
            'id' => $author->id,
            'type' => get_class($author),
            'name' => $author->name ?? $author->username ?? 'Author',
            'photo' => $author->hero_img_url ?? null,
            'hash' => $author->id,
        ];

        try {
            $team = $proposal->team;
            if ($team) {
                foreach ($team as $member) {
                    if ($member->id == $author->id) {
                        continue;
                    }

                    $teamConnections['nodes'][] = [
                        'id' => $member->id,
                        'type' => get_class($member),
                        'name' => $member->name ?? $member->username ?? 'Team Member',
                        'photo' => $member->hero_img_url ?? null,
                        'hash' => $member->id,
                    ];

                    $teamConnections['links'][] = [
                        'source' => $author->id,
                        'target' => $member->id,
                    ];

                    foreach ($team as $otherMember) {
                        if ($member->id != $otherMember->id && $otherMember->id != $author->id) {
                            $teamConnections['links'][] = [
                                'source' => $member->id,
                                'target' => $otherMember->id,
                            ];
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            \Log::error('Error loading team members for network data: '.$e->getMessage());
        }

        $teamConnections['links'] = array_values(array_unique(array_map(function ($link) {
            return json_encode($link);
        }, $teamConnections['links']), SORT_REGULAR));

        $teamConnections['links'] = array_map(function ($link) {
            return json_decode($link, true);
        }, $teamConnections['links']);

        return $teamConnections;
    }

    private function getProposalBaseData(Request $request, Proposal $proposal)
    {
        $this->getProps($request);

        $proposal->loadMissing(['author']);

        $proposalData = ProposalData::from($proposal);
        //        $proposalData['alignment_score'] = $proposal->getDiscussionRankingScore('Impact Alignment') ?? 0;
        //        $proposalData['feasibility_score'] = 0; // $proposal->getDiscussionRankingScore('Feasibility') ?? 0;
        //        $proposalData['auditability_score'] = 0; // $proposal->getDiscussionRankingScore('Value for money') ?? 0;

        return $proposalData;
    }

    public function getProposalMetrics(Request $request)
    {
        // Create cache key based on request parameters
        $cacheKey = $this->generateMetricsCacheKey($request);

        return Cache::remember($cacheKey, 300, function () use ($request) {
            return $this->computeProposalMetrics($request);
        });
    }

    /**
     * Generate a cache key for metrics based on request parameters
     */
    private function generateMetricsCacheKey(Request $request): string
    {
        $keyData = [
            'rules' => $request->input('rules', []),
            'chartType' => $request->input('chartType'),
            'referer_params' => $this->extractRefererParams($request),
            'query_params' => $request->query->all(),
        ];

        return 'proposal_metrics_'.hash('sha256', json_encode($keyData));
    }

    /**
     * Extract and parse referer parameters.
     */
    private function extractRefererParams(Request $request): array
    {
        $referer = $request->headers->get('referer');
        if (! $referer) {
            return [];
        }

        $parsedUrl = parse_url($referer);
        if (! isset($parsedUrl['query'])) {
            return [];
        }

        // Parse query string manually without using parse_str
        $refererParams = [];
        $pairs = explode('&', $parsedUrl['query']);

        foreach ($pairs as $pair) {
            if (empty($pair)) {
                continue;
            }

            $parts = explode('=', $pair, 2);
            $key = urldecode($parts[0]);
            $value = isset($parts[1]) ? urldecode($parts[1]) : '';

            // Handle array parameters (e.g., key[]=value or key[index]=value)
            if (str_ends_with($key, '[]')) {
                $arrayKey = substr($key, 0, -2);
                if (! isset($refererParams[$arrayKey])) {
                    $refererParams[$arrayKey] = [];
                }
                $refererParams[$arrayKey][] = $value;
            } elseif (preg_match('/^(.+)\[(.*)\]$/', $key, $matches)) {
                $arrayKey = $matches[1];
                $index = $matches[2];
                if (! isset($refererParams[$arrayKey])) {
                    $refererParams[$arrayKey] = [];
                }
                if ($index === '') {
                    $refererParams[$arrayKey][] = $value;
                } else {
                    $refererParams[$arrayKey][$index] = $value;
                }
            } else {
                $refererParams[$key] = $value;
            }
        }

        return $refererParams;
    }

    /**
     * Compute proposal metrics.
     */
    private function computeProposalMetrics(Request $request): array
    {
        $refererParams = $this->extractRefererParams($request);
        $allParams = $refererParams + $request->query->all();

        $mergedRequest = $allParams !== $request->query->all()
            ? $request->duplicate($allParams, $request->request->all())
            : $request;

        $this->getProps($mergedRequest);

        $proposalMetricRules = $request->input('rules', []);
        $chartType = $request->input('chartType');

        if (empty($proposalMetricRules)) {
            return [];
        }

        $proposalRuleTitles = array_values(array_unique($proposalMetricRules));
        sort($proposalRuleTitles);
        $proposalRuleTitlesKey = implode(',', $proposalRuleTitles);

        $metrics = $this->findMatchingMetrics($chartType, $proposalRuleTitles, $proposalRuleTitlesKey);
        if ($metrics->isEmpty()) {
            return [];
        }

        $searchQuery = $this->queryParams[ProposalSearchParams::QUERY()->value] ?? '';
        $filters = $this->getUserFilters();

        return $this->processMetricsData($metrics, $filters, $searchQuery, $chartType);
    }

    /**
     * Find matching metrics
     */
    private function findMatchingMetrics(string $chartType, array $proposalRuleTitles, string $proposalRuleTitlesKey)
    {

        return Metric::with([
            'rules' => fn ($query) => $query->whereIn('title', $proposalRuleTitles),
        ])
            ->where('type', $chartType)
            ->get();
        //            ->filter(function ($metric) use ($proposalRuleTitles, $proposalRuleTitlesKey) {
        //                $metricRuleTitles = $metric->rules->pluck('title')->toArray();
        //
        //                if (count($metricRuleTitles) !== count($proposalRuleTitles)) {
        //                    return false;
        //                }
        //
        //                sort($metricRuleTitles);
        //                $metricRuleTitlesKey = implode(',', $metricRuleTitles);
        //
        //                return $metricRuleTitlesKey === $proposalRuleTitlesKey;
        //            });
    }

    /**
     * Process metrics data efficiently
     */
    private function processMetricsData($metrics, array $filters, string $searchQuery, string $chartType): array
    {
        $multiSeriesData = [];

        foreach ($metrics as $metric) {
            $multiSeriesData[] = $metric->multiSeriesSearchData($filters, $searchQuery, $chartType);
        }

        return $multiSeriesData;
    }
}
