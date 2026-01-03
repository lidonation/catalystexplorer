<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\GetUserFilters;
use App\DataTransferObjects\FundData;
use App\DataTransferObjects\ProposalData;
use App\DataTransferObjects\ReviewData;
use App\Enums\ProposalSearchParams;
use App\Http\Requests\UpdateProposalQuickPitchRequest;
use App\Models\BookmarkItem;
use App\Models\CatalystProfile;
use App\Models\Connection;
use App\Models\Fund;
use App\Models\IdeascaleProfile;
use App\Models\Metric;
use App\Models\Proposal;
use App\Repositories\ProposalRepository;
use App\Services\VideoService;
use App\Services\WalletInfoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Fluent;
use Illuminate\Support\Stringable;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Scout\Builder;
use Spatie\Browsershot\Browsershot;
use Symfony\Component\HttpFoundation\Request as SymfonyRequest;

class ProposalsController extends Controller
{
    protected int $currentPage = 1;

    protected int $limit = 32;

    protected array $queryParams = [];

    protected ?Request $request = null;

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

    public int $sumBudgetsUSDM = 0;

    public int $sumApprovedADA = 0;

    public int $sumApprovedUSD = 0;

    public int $sumApprovedUSDM = 0;

    public int $sumDistributedADA = 0;

    public int $sumDistributedUSD = 0;

    public int $sumDistributedUSDM = 0;

    public int $sumCompletedUSD = 0;

    public int $inProgressProposals = 0;

    public int $unfundedProposals = 0;

    public int $fundedProposals = 0;

    public int $groupsCount = 0;

    public int $communitiesCount = 0;

    public function __construct(
        private readonly WalletInfoService $walletInfoService
    ) {}

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
                    'requestedUSDM' => $this->sumBudgetsUSDM,
                    'awardedUSD' => $this->sumApprovedUSD,
                    'awardedADA' => $this->sumApprovedADA,
                    'awardedUSDM' => $this->sumApprovedUSDM,
                    'distributedUSD' => $this->sumDistributedUSD,
                    'distributedADA' => $this->sumDistributedADA,
                    'distributedUSDM' => $this->sumDistributedUSDM,
                    'completionRate' => $this->approvedProposals > 0
                        ? round(($this->completedProposals / $this->approvedProposals) * 100, 1)
                        : 0,
                    'avgRequestedADA' => $this->submittedProposals > 0
                        ? round($this->sumBudgetsADA / $this->submittedProposals)
                        : 0,
                    'avgRequestedUSD' => $this->submittedProposals > 0
                        ? round($this->sumBudgetsUSD / $this->submittedProposals)
                        : 0,
                    'avgRequestedUSDM' => $this->submittedProposals > 0
                        ? round($this->sumBudgetsUSDM / $this->submittedProposals)
                        : 0,
                    'inProgress' => $this->inProgressProposals,
                    'unfunded' => $this->unfundedProposals,
                    'funded' => $this->fundedProposals,
                    'groupsCount' => $this->groupsCount,
                    'communitiesCount' => $this->communitiesCount,
                ],
            ]
        );
    }

    public function proposal(Request $request, $slug): Response
    {
        // Load links relationship if we're on the links page
        $withRelations = ['team.model'];
        if (str_contains($request->path(), '/links')) {
            $withRelations[] = 'links';
        }

        $proposal = Proposal::with($withRelations)
            ->where('slug', $slug)
            ->firstOrFail();

        $this->getProps($request);

        $proposalId = $proposal->id;

        $cacheKey = "proposal:{$proposalId}:base_data";

        $userProfileIds = CatalystProfile::where('claimed_by', Auth::id())->pluck('id');

        $userHasProfileInProposal = $proposal->users->contains(function ($user) use ($userProfileIds) {
            return $userProfileIds->contains($user->profile_id);
        });

        $activeFundId = Fund::latest('launched_at')
            ->pluck('id')
            ->first();

        $isInActiveFund = $proposal->fund_id === $activeFundId;
        $quickpitchMetadata = app(VideoService::class)->getVideoMetadata($proposal->quickpitch);

        $proposalData = Cache::remember($cacheKey, now()->addMinutes(0), function () use ($proposal) {
            $proposal->load([
                'fund',
                'campaign',
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
                // Get all claimed profiles (both IdeascaleProfile and CatalystProfile) by the current user
                $user = Auth::user();
                $claimedProfileIds = [];

                if ($user) {
                    // Get claimed IdeascaleProfile IDs
                    $claimedIdeascaleIds = $user->claimed_ideascale_profiles()->pluck('ideascale_profiles.id')->toArray();

                    // Get claimed CatalystProfile IDs
                    $claimedCatalystIds = $user->claimed_catalyst_profiles()->pluck('catalyst_profiles.id')->toArray();

                    $claimedProfileIds = [
                        'ideascale' => $claimedIdeascaleIds,
                        'catalyst' => $claimedCatalystIds,
                    ];
                }

                $counts = $this->getCounts($claimedProfileIds);

                // Get all team members (both IdeascaleProfile and CatalystProfile) for display
                $data['users'] = $proposal->team ? $proposal->team->map(function ($teamMember) {
                    $profile = $teamMember->model;
                    if (! $profile) {
                        return null;
                    }

                    return [
                        'id' => $profile->id,
                        'ideascale_id' => $profile->ideascale_id ?? null,
                        'catalyst_id' => $profile->catalyst_id ?? null,
                        'username' => $profile->username,
                        'name' => $profile->name,
                        'bio' => $profile->bio ?? null,
                        'hero_img_url' => $profile->hero_img_url ?? $profile->gravatar ?? null,
                        'profile_type' => class_basename($teamMember->profile_type),
                        'proposals_completed' => 0, // Disable for now
                        'first_timer' => false, // Disable for now
                    ];
                })->filter()->toArray() : [];
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

                            $reviewsData = $reviews->map(function ($review) {
                                return [
                                    'hash' => $review->id,
                                    'parent_id' => $review->parent_id,
                                    'title' => $review->title,
                                    'content' => $review->content,
                                    'status' => $review->status ?? 'published',
                                    'rating' => null,
                                    'proposal' => null,
                                    'reviewer' => null,
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
            'userHasProfileInProposal' => $userHasProfileInProposal,
            'isInActiveFund' => $isInActiveFund,
            'quickpitchMetadata' => $quickpitchMetadata,
        ];

        return match (true) {
            str_contains($request->path(), '/details') => Inertia::render('Proposals/Details/Index', $props),
            str_contains($request->path(), '/schedule') => Inertia::render('Proposals/Schedule/Index', $props),
            str_contains($request->path(), '/community-review') => Inertia::render('Proposals/CommunityReview/Index', $props),
            str_contains($request->path(), '/team-information') => Inertia::render('Proposals/TeamInformation/Index', $props),
            str_contains($request->path(), '/links') => Inertia::render('Proposals/Links/Index', $props),
            default => Inertia::render('Proposals/Details/Index', $props),
        };
    }

    public function proposalSchedule(Request $request, $slug)
    {
        $proposal = Proposal::with(['schedule.milestones', 'author', 'fund', 'campaign'])
            ->where('slug', $slug)->firstOrFail();

        $this->getProps($request);
        $proposalData = ProposalData::from($proposal);

        return Inertia::render(
            'Proposals/Schedule/Index',
            [
                'proposal' => $proposalData,
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
        $proposal->load(['fund', 'campaign']);

        Gate::authorize('manage', $proposal);

        $metadata = app(VideoService::class)->getVideoMetadata($proposal->quickpitch);

        $user = Auth::user();

        $walletsPaginator = $this->walletInfoService->getUserWallets($user->getAuthIdentifier());
        $linkedStakeAddresses = $proposal->signatures()->pluck('stake_address');

        $walletsPaginator->getCollection()->transform(function ($wallet) use ($linkedStakeAddresses) {
            return $wallet->withLinked(
                $linkedStakeAddresses->contains($wallet->stakeAddress)
            );
        });

        $wallets = $walletsPaginator->getCollection();

        $linkedWallet = $wallets->filter(fn ($wallet) => $wallet->linked)->first();

        $hasMoreThanOneWallet = $wallets->count() > 1;

        return Inertia::render('My/Proposals/ManageProposal', [
            'proposal' => ProposalData::from($proposal),
            'quickpitchMetadata' => $metadata,
            'linkedWallet' => $linkedWallet,
            'hasMoreThanOneWallet' => $hasMoreThanOneWallet,
        ]);
    }

    public function updateQuickPitch(UpdateProposalQuickPitchRequest $request, Proposal $proposal): RedirectResponse
    {
        Gate::authorize('manage', $proposal);

        $url = $request->validated()['quickpitch'];

        try {
            $normalizedUrl = app(VideoService::class)->normalizeYouTubeUrl($url);

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
            }

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

    public function deleteQuickPitch(Request $request, Proposal $proposal): RedirectResponse
    {
        Gate::authorize('manage', $proposal);

        $proposal->update([
            'quickpitch' => null,
            'quickpitch_length' => null,
        ]);

        return redirect()->back()->with('success', 'Quick pitch deleted successfully');
    }

    public function getProposalPropertyMap(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'proposal_ids' => ['required', 'array', 'min:1'],
            'proposal_ids.*' => ['string'],
            'properties' => ['array', 'nullable'],
            'properties.*' => ['string'],
        ]);

        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        $proposalIds = collect($validated['proposal_ids'])
            ->filter()
            ->map(static fn ($id) => (string) $id)
            ->unique()
            ->values();

        if ($proposalIds->isEmpty()) {
            return response()->json([]);
        }

        $propertyResolvers = [
            'vote' => function (Collection $ids) use ($user): Collection {
                $votesByProposal = BookmarkItem::query()
                    ->where('user_id', $user->id)
                    ->where('model_type', Proposal::class)
                    ->whereIn('model_id', $ids)
                    ->orderByDesc('updated_at')
                    ->get(['model_id', 'vote', 'updated_at'])
                    ->groupBy('model_id')
                    ->map(static fn ($items) => $items->first()?->vote?->value);

                return $ids->mapWithKeys(static fn ($id) => [$id => $votesByProposal->get($id)]);
            },
        ];

        $properties = collect($validated['properties'] ?? ['vote'])
            ->map(static fn ($prop) => strtolower($prop))
            ->filter(static fn ($prop) => isset($propertyResolvers[$prop]))
            ->unique()
            ->values();

        if ($properties->isEmpty()) {
            return response()->json(
                $proposalIds->mapWithKeys(static fn ($id) => [$id => []])
            );
        }

        $results = $proposalIds->mapWithKeys(static fn ($id) => [$id => []]);

        foreach ($properties as $property) {
            /** @var Collection $values */
            $values = $propertyResolvers[$property]($proposalIds);

            $results = $results->map(
                static function (array $payload, string $id) use ($property, $values): array {
                    $payload[$property] = $values->get($id);

                    return $payload;
                }
            );
        }

        return response()->json($results);
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
        $this->request = $request;
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
        return app(GetUserFilters::class)($this->request);
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

        if (isset($facets['amount_requested_USDM'])) {
            foreach ($facets['amount_requested_USDM'] as $key => $value) {
                $this->sumBudgetsUSDM += intval($key * $value);
            }
        }

        if (isset($facets['amount_awarded_USDM'])) {
            foreach ($facets['amount_awarded_USDM'] as $key => $value) {
                $this->sumApprovedUSDM += intval($key * $value);
            }
        }

        if (isset($facets['amount_received_USDM'])) {
            foreach ($facets['amount_received_USDM'] as $key => $value) {
                $this->sumDistributedUSDM += intval($key * $value);
            }
        }

        if (isset($facets['status']['complete'])) {
            $this->completedProposals = $facets['status']['complete'];
        }

        if (isset($facets['status']['in_progress'])) {
            $this->inProgressProposals = $facets['status']['in_progress'];
        }

        if (isset($facets['status'])) {
            foreach ($facets['status'] as $key => $value) {
                $this->submittedProposals += $value;
            }
        }

        if (isset($facets['funding_status']['not_approved'])) {
            $this->unfundedProposals = $facets['funding_status']['not_approved'];
        }

        // Funded = proposals that received funding (funded + leftover)
        if (isset($facets['funding_status']['funded']) || isset($facets['funding_status']['leftover'])) {
            $this->fundedProposals = ($facets['funding_status']['funded'] ?? 0) + ($facets['funding_status']['leftover'] ?? 0);
        }

        // Approved = all proposals that passed voting (funded + leftover + over_budget)
        $this->approvedProposals = $this->fundedProposals + ($facets['funding_status']['over_budget'] ?? 0);

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

        if (isset($facets['groups.id'])) {
            $this->groupsCount = count($facets['groups.id']);
        }

        if (isset($facets['communities.id'])) {
            $this->communitiesCount = count($facets['communities.id']);
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

    public function getCounts($claimedProfileIds)
    {
        if (empty($claimedProfileIds) || (empty($claimedProfileIds['ideascale']) && empty($claimedProfileIds['catalyst']))) {
            return [
                'userCompleteProposalsCount' => 0,
                'userOutstandingProposalsCount' => 0,
                'catalystConnectionCount' => 0,
            ];
        }

        try {
            $ideascaleIds = $claimedProfileIds['ideascale'] ?? [];
            $catalystIds = $claimedProfileIds['catalyst'] ?? [];

            // Count complete proposals from both profile types using the proposal_profiles pivot table
            $userCompleteProposalsCount = Proposal::where('status', 'complete')
                ->where(function ($query) use ($ideascaleIds, $catalystIds) {
                    if (! empty($ideascaleIds)) {
                        $query->orWhereHas('team', function ($teamQuery) use ($ideascaleIds) {
                            $teamQuery->where('profile_type', IdeascaleProfile::class)
                                ->whereIn('profile_id', $ideascaleIds);
                        });
                    }
                    if (! empty($catalystIds)) {
                        $query->orWhereHas('team', function ($teamQuery) use ($catalystIds) {
                            $teamQuery->where('profile_type', CatalystProfile::class)
                                ->whereIn('profile_id', $catalystIds);
                        });
                    }
                })
                ->count();

            // Count in-progress proposals from both profile types
            $userOutstandingProposalsCount = Proposal::where('status', 'in_progress')
                ->where(function ($query) use ($ideascaleIds, $catalystIds) {
                    if (! empty($ideascaleIds)) {
                        $query->orWhereHas('team', function ($teamQuery) use ($ideascaleIds) {
                            $teamQuery->where('profile_type', IdeascaleProfile::class)
                                ->whereIn('profile_id', $ideascaleIds);
                        });
                    }
                    if (! empty($catalystIds)) {
                        $query->orWhereHas('team', function ($teamQuery) use ($catalystIds) {
                            $teamQuery->where('profile_type', CatalystProfile::class)
                                ->whereIn('profile_id', $catalystIds);
                        });
                    }
                })
                ->count();

            // Count connections - include both IdeascaleProfile and CatalystProfile connections
            $catalystConnectionCount = 0;
            if (! empty($ideascaleIds)) {
                $catalystConnectionCount += Connection::whereIn('previous_model_id', $ideascaleIds)
                    ->where('previous_model_type', IdeascaleProfile::class)
                    ->distinct()
                    ->count();
            }
            if (! empty($catalystIds)) {
                $catalystConnectionCount += Connection::whereIn('previous_model_id', $catalystIds)
                    ->where('previous_model_type', CatalystProfile::class)
                    ->distinct()
                    ->count();
            }

            return [
                'userCompleteProposalsCount' => $userCompleteProposalsCount,
                'userOutstandingProposalsCount' => $userOutstandingProposalsCount,
                'catalystConnectionCount' => $catalystConnectionCount,
            ];
        } catch (\Exception $e) {
            \Log::error('Error in getCounts method', [
                'error' => $e->getMessage(),
                'claimedProfileIds' => $claimedProfileIds,
            ]);

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
        // Get all metrics of the given chart type with all their rules
        $allMetrics = Metric::with('rules')
            ->where('type', $chartType)
            ->get();

        // Find metrics that have at least some of the requested rules
        $matchingMetrics = $allMetrics->filter(function ($metric) use ($proposalRuleTitles) {
            $metricRuleTitles = $metric->rules->pluck('title')->toArray();
            $intersection = array_intersect($metricRuleTitles, $proposalRuleTitles);

            // Return metrics that have at least one matching rule
            return count($intersection) > 0;
        });

        // Filter the rules to only include requested ones
        $matchingMetrics->each(function ($metric) use ($proposalRuleTitles) {
            $metric->setRelation('rules', $metric->rules->filter(function ($rule) use ($proposalRuleTitles) {
                return in_array($rule->title, $proposalRuleTitles);
            }));
        });

        return $matchingMetrics;
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

    /**
     * Generate Open Graph image for social media sharing
     */
    public function generateOgImage(string $slug)
    {
        // Use default configured disk (respects FILESYSTEM_DISK env var)
        $disk = Storage::disk();
        $imagePath = "og-images/{$slug}.png";

        // Return cached image if it exists and is less than 24 hours old
        try {
            if ($disk->exists($imagePath)) {
                $lastModified = $disk->lastModified($imagePath);
                if (now()->timestamp - $lastModified < 86400) { // 24 hours
                    return response($disk->get($imagePath))
                        ->header('Content-Type', 'image/png')
                        ->header('Cache-Control', 'public, max-age=86400');
                }
            }
        } catch (\Exception $e) {
            // If we can't check existence (e.g., S3 issues), just regenerate
            Log::warning('Could not check OG image existence, regenerating', [
                'slug' => $slug,
                'error' => $e->getMessage(),
            ]);
        }

        // Fetch proposal
        $proposal = Proposal::with(['fund', 'campaign', 'team.model'])
            ->where('slug', $slug)
            ->firstOrFail();

        // Determine status text and color
        [$statusText, $statusColor] = $this->getProposalStatusInfo($proposal);

        // Format budget
        $formattedBudget = $this->formatBudget($proposal->amount_requested, $proposal->currency);

        // Format project length
        $formattedLength = $this->formatProjectLength($proposal->project_length);

        // Render Blade view
        $html = view('components.proposal-og-card', [
            'proposal' => $proposal,
            'statusText' => $statusText,
            'statusColor' => $statusColor,
            'formattedBudget' => $formattedBudget,
            'formattedLength' => $formattedLength,
        ])->render();

        // Generate image using Browsershot
        try {
            $png = Browsershot::html($html)
                ->setChromePath('/usr/bin/chromium')
                ->deviceScaleFactor(2)
                ->windowSize(1200, 630)
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

            // Store the image using configured disk
            $disk->put($imagePath, $png);

            return response($png)
                ->header('Content-Type', 'image/png')
                ->header('Cache-Control', 'public, max-age=86400');
        } catch (\Exception $e) {
            Log::error('Failed to generate OG image for proposal', [
                'slug' => $slug,
                'error' => $e->getMessage(),
            ]);

            // Return a 500 error
            abort(500, 'Failed to generate image');
        }
    }

    /**
     * Get proposal status information (text and color)
     */
    private function getProposalStatusInfo(Proposal $proposal): array
    {
        $status = $proposal->status;
        $fundingStatus = $proposal->funding_status;

        if ($status === 'pending') {
            return ['Vote Pending', 'bg-blue-500'];
        } elseif ($fundingStatus === 'withdrawn') {
            return ['Withdrawn', 'bg-gray-400'];
        } elseif ($status === 'complete') {
            return ['Complete', 'bg-green-500'];
        } elseif ($status === 'in_progress') {
            return ['In Progress', 'bg-blue-500'];
        } elseif ($status === 'unfunded') {
            return ['Unfunded', 'bg-orange-500'];
        }

        return ['Pending', 'bg-gray-500'];
    }

    /**
     * Format budget amount with currency
     */
    private function formatBudget(?float $amount, mixed $currency = null): string
    {
        if ($amount === null) {
            return 'N/A';
        }

        // Handle CatalystCurrencies enum
        $currencyValue = null;
        if ($currency instanceof \App\Enums\CatalystCurrencies) {
            $currencyValue = $currency->value;
        } elseif (is_string($currency)) {
            $currencyValue = $currency;
        }

        // Format with thousands separator
        $formatted = number_format($amount, 0, '.', ',');

        // Add currency symbol (₳ for ADA)
        if ($currencyValue === 'ADA') {
            return "₳{$formatted}";
        } elseif ($currencyValue) {
            return "{$currencyValue} {$formatted}";
        }

        return $formatted;
    }

    /**
     * Format project length in months
     */
    private function formatProjectLength(?int $months): string
    {
        if ($months === null || $months === 0) {
            return 'N/A';
        }

        if ($months === 1) {
            return '1 month';
        }

        return "{$months} months";
    }
}
