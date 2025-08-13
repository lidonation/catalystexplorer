<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\CommunityData;
use App\DataTransferObjects\GroupData;
use App\DataTransferObjects\IdeascaleProfileData;
use App\DataTransferObjects\ProposalData;
use App\Enums\CatalystCurrencySymbols;
use App\Enums\CommunitySearchParams;
use App\Enums\ProposalSearchParams;
use App\Models\Community;
use App\Models\Fund;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Stringable;
use Inertia\Inertia;
use Laravel\Scout\Builder;
use Staudenmeir\EloquentHasManyDeep\HasManyDeep;

class CommunitiesController extends Controller
{
    protected int $currentPage = 1;

    protected int $limit = 24;

    protected array $queryParams = [];

    protected null|string|Stringable $search = null;

    protected ?string $sortBy = 'title';

    protected ?string $sortOrder = 'asc';

    protected ?bool $fundedProposalsFilter = false;

    protected Collection $awardedUsdFilter;

    protected Collection $awardedAdaFilter;

    public $fundsFilter;

    public $tagsFilter;

    public $ideascaleProfileFilter;

    protected Builder $searchBuilder;

    public int $maxProposalsCount;

    public float $maxAwardedUsd;

    public float $maxAwardedAda;

    public function index(Request $request): \Inertia\Response
    {
        $this->getProps($request);

        $communities = $this->query($request);

        $props = [
            'filters' => $this->queryParams,
            'filterCounts' => [
                'proposalsCount' => $this->maxProposalsCount,
                'totalAwardedAda' => $this->maxAwardedAda,
                'totalAwardedUsd' => $this->maxAwardedUsd,
            ],
            'communities' => $communities,
        ];

        return Inertia::render('Communities/Index', $props);
    }

    public function show(Request $request, Community $community): \Inertia\Response
    {
        $currentPage = LengthAwarePaginator::resolveCurrentPage('p');
        $path = $request->path();

        $community = Cache::remember("community:{$community->id}:full", now()->addMinutes(10), function () use ($community) {
            return $community
                ->load([
                    'ideascale_profiles' => fn (HasManyDeep $q) => $q->limit(5),
                    'ideascale_profiles.media',
                    'users' => fn ($q) => $q->limit(5)->with('media'),
                ])
                ->loadCount([
                    'completed_proposals',
                    'funded_proposals',
                    'unfunded_proposals',
                    'proposals',
                    'ideascale_profiles',
                    'users',
                ])
                ->append([
                    'amount_distributed_ada',
                    'amount_distributed_usd',
                    'amount_awarded_ada',
                    'amount_awarded_usd',
                ]);
        });

        // Fund titles
        $fundTitles = Cache::remember(
            'fund_titles',
            now()->addDay(),
            fn () => Fund::pluck('title')
                ->sortBy(fn ($title) => (int) filter_var($title, FILTER_SANITIZE_NUMBER_INT))
                ->values()
        );

        // Funded proposals
        $fundedProposals = Cache::remember("community:{$community->id}:funded_proposals", now()->addMinutes(10), function () use ($community) {
            return Community::with('funded_proposals.fund')->find($community->id)->funded_proposals;
        });

        // Chart computation
        $calculateSum = function ($proposals, $fundTitle, $currency, $field) {
            return $proposals->filter(function ($proposal) use ($fundTitle, $currency) {
                $fund = $proposal->fund;

                return $fund && $fund->title === $fundTitle && $fund->currency === $currency;
            })->sum($field);
        };

        // Cached chart data
        $chartData = Cache::remember("community:{$community->id}:chart_data", now()->addMinutes(10), function () use ($fundTitles, $fundedProposals, $calculateSum) {
            return [
                'amountAwardedChartData' => [
                    [
                        'id' => 'Awarded ADA',
                        'data' => $fundTitles->map(fn ($fundTitle) => [
                            'x' => $fundTitle,
                            'y' => $calculateSum($fundedProposals, $fundTitle, CatalystCurrencySymbols::ADA->name, 'amount_requested'),
                        ])->values(),
                    ],
                    [
                        'id' => 'Awarded USD',
                        'data' => $fundTitles->map(fn ($fundTitle) => [
                            'x' => $fundTitle,
                            'y' => $calculateSum($fundedProposals, $fundTitle, CatalystCurrencySymbols::USD->name, 'amount_requested'),
                        ])->values(),
                    ],
                ],
                'amountDistributedChartData' => [
                    [
                        'id' => 'Distributed ADA',
                        'data' => $fundTitles->map(fn ($fundTitle) => [
                            'x' => $fundTitle,
                            'y' => $calculateSum($fundedProposals, $fundTitle, CatalystCurrencySymbols::ADA->name, 'amount_received'),
                        ])->values(),
                    ],
                    [
                        'id' => 'Distributed USD',
                        'data' => $fundTitles->map(fn ($fundTitle) => [
                            'x' => $fundTitle,
                            'y' => $calculateSum($fundedProposals, $fundTitle, CatalystCurrencySymbols::USD->name, 'amount_received'),
                        ])->values(),
                    ],
                ],
                'amountRemainingChartData' => [
                    [
                        'id' => 'Remaining ADA',
                        'data' => $fundTitles->map(function ($fundTitle) use ($calculateSum, $fundedProposals) {
                            $awarded = $calculateSum($fundedProposals, $fundTitle, CatalystCurrencySymbols::ADA->name, 'amount_requested');
                            $distributed = $calculateSum($fundedProposals, $fundTitle, CatalystCurrencySymbols::ADA->name, 'amount_received');

                            return ['x' => $fundTitle, 'y' => $awarded - $distributed];
                        })->values(),
                    ],
                    [
                        'id' => 'Remaining USD',
                        'data' => $fundTitles->map(function ($fundTitle) use ($calculateSum, $fundedProposals) {
                            $awarded = $calculateSum($fundedProposals, $fundTitle, CatalystCurrencySymbols::USD->name, 'amount_requested');
                            $distributed = $calculateSum($fundedProposals, $fundTitle, CatalystCurrencySymbols::USD->name, 'amount_received');

                            return ['x' => $fundTitle, 'y' => $awarded - $distributed];
                        })->values(),
                    ],
                ],
            ];
        });

        // Centralized smart props
        $props = [
            'community' => CommunityData::from($community),

            'amountAwardedChartData' => $chartData['amountAwardedChartData'],
            'amountDistributedChartData' => $chartData['amountDistributedChartData'],
            'amountRemainingChartData' => $chartData['amountRemainingChartData'],

            'proposals' => Inertia::optional(function () use ($community, $currentPage) {
                return Cache::remember("community:{$community->id}:proposals:page:{$currentPage}", now()->addMinutes(5), function () use ($community, $currentPage) {
                    return to_length_aware_paginator(
                        ProposalData::collect(
                            $community->proposals()
                                ->with(['users', 'fund'])
                                ->paginate(11, ['*'], 'p', $currentPage)
                        )
                    )->onEachSide(0);
                });
            }),

            'ideascaleProfiles' => Inertia::optional(function () use ($community, $currentPage) {
                return Cache::remember("community:{$community->id}:ideascale_profiles:page:{$currentPage}", now()->addMinutes(5), function () use ($community, $currentPage) {
                    return to_length_aware_paginator(
                        IdeascaleProfileData::collect(
                            $community->ideascale_profiles()
                                ->withCount([
                                    'proposals',
                                    'funded_proposals',
                                    'unfunded_proposals',
                                    'completed_proposals',
                                    'own_proposals',
                                    'collaborating_proposals',
                                ])
                                ->paginate(19, ['*'], 'p', $currentPage)
                        )
                    );
                });
            }),

            'groups' => Inertia::optional(function () use ($community, $currentPage) {
                return Cache::remember("community:{$community->id}:groups:page:{$currentPage}", now()->addMinutes(5), function () use ($community, $currentPage) {
                    return to_length_aware_paginator(
                        GroupData::collect(
                            $community->groups()
                                ->withCount([
                                    'proposals',
                                    'funded_proposals',
                                    'unfunded_proposals',
                                    'completed_proposals',
                                ])
                                ->paginate(12, ['*'], 'p', $currentPage)
                        )
                    );
                });
            }),

            'isMember' => Auth::check() ? $community->users()->where('users.id', Auth::id())->exists() : false,
        ];

        return match (true) {
            str_contains($path, '/dashboard') => Inertia::render('Communities/Dashboard/Index', $props),
            str_contains($path, '/proposals') => Inertia::render('Communities/Proposals/Index', $props),
            str_contains($path, '/ideascale-profiles') => Inertia::render('Communities/IdeascaleProfiles/Index', $props),
            str_contains($path, '/groups') => Inertia::render('Communities/Groups/Index', $props),
            str_contains($path, '/events') => Inertia::render('Communities/Events/Index', $props),
            default => Inertia::render('Communities/Dashboard/Index', $props),
        };
    }

    public function query(Request $request)
    {
        $query = Community::query()->with([
            'ideascale_profiles' => fn (HasManyDeep $q) => $q->limit(5),
            'ideascale_profiles.media',
            'users' => fn ($q) => $q->limit(5)->with('media'),
        ])
            ->withCount([
                'proposals',
                'ideascale_profiles',
                'users',
            ]);

        // set necessary counts
        $this->setCounts($query);

        $filters = [
            'search' => $request->input('q', null),
        ];
        $query->filter($filters);

        if (isset($this->queryParams[CommunitySearchParams::FUNDING_STATUS()->value])) {
            $query->whereHas('proposals', function ($query) {
                $query->whereIn('funding_status', $this->queryParams[CommunitySearchParams::FUNDING_STATUS()->value]);
            });
        }

        if (isset($this->queryParams[CommunitySearchParams::PROJECT_STATUS()->value])) {
            $query->whereHas('proposals', function ($query) {
                $query->whereIn('status', $this->queryParams[CommunitySearchParams::PROJECT_STATUS()->value]);
            });
        }

        if (isset($this->queryParams[CommunitySearchParams::CAMPAIGNS()->value])) {
            $campaignIds = $this->queryParams[CommunitySearchParams::CAMPAIGNS()->value];
            $query->whereHas('proposals.campaign', function ($query) use ($campaignIds) {
                $query->whereIn('id', (array) $campaignIds);
            });
        }

        if (isset($this->queryParams[CommunitySearchParams::IDEASCALE_PROFILES()->value])) {
            $ideascaleProfileIds = $this->queryParams[CommunitySearchParams::IDEASCALE_PROFILES()->value];
            $query->whereHas('ideascale_profiles', function ($query) use ($ideascaleProfileIds) {
                $query->whereIn('id', (array) $ideascaleProfileIds);
            });
        }

        if (isset($this->queryParams[CommunitySearchParams::TAGS()->value])) {
            $tagIds = $this->queryParams[CommunitySearchParams::TAGS()->value];
            $query->whereHas('tags', function ($query) use ($tagIds) {
                $query->whereIn('tags.id', (array) $tagIds);
            });
        }

        if (isset($this->queryParams[CommunitySearchParams::PROPOSALS()->value])) {
            $proposalsRange = collect((object) $this->queryParams[ProposalSearchParams::PROPOSALS()->value]);

            $query = DB::query()
                ->fromSub($query->toBase(), 'communities')
                ->whereBetween('proposals_count', [$proposalsRange->first(), $proposalsRange->last()]);
        }

        if (isset($this->queryParams[CommunitySearchParams::AWARDED_USD()->value])) {
            $awardedUsd = collect((object) $this->queryParams[ProposalSearchParams::AWARDED_USD()->value]);

            // Build the subquery to calculate awarded USD per community
            $awardedUsdSub = DB::table('community_has_proposal as chp')
                ->selectRaw('chp.community_id, COALESCE(SUM(p.amount_requested), 0) as awarded_usd')
                ->join('proposals as p', 'p.id', '=', 'chp.proposal_id')
                ->join('funds as f', 'f.id', '=', 'p.fund_id')
                ->where('p.type', 'proposal')
                ->whereNotNull('p.funded_at')
                ->where('f.currency', CatalystCurrencySymbols::USD->name)
                ->groupBy('chp.community_id');

            // Now join this subquery to the main communities query
            $query = $query->leftJoinSub($awardedUsdSub, 'usd', 'usd.community_id', '=', 'communities.id')
                ->select('communities.*', 'usd.awarded_usd') // or use selectRaw() if needed
                ->whereBetween('usd.awarded_usd', [$awardedUsd->first(), $awardedUsd->last()]);
        }

        if (isset($this->queryParams[CommunitySearchParams::AWARDED_ADA()->value])) {
            $awardedAda = collect((object) $this->queryParams[ProposalSearchParams::AWARDED_ADA()->value]);

            // Build the subquery to calculate awarded USD per community
            $awardedAdaSub = DB::table('community_has_proposal as chp')
                ->selectRaw('chp.community_id, COALESCE(SUM(p.amount_requested), 0) as awarded_ada')
                ->join('proposals as p', 'p.id', '=', 'chp.proposal_id')
                ->join('funds as f', 'f.id', '=', 'p.fund_id')
                ->where('p.type', 'proposal')
                ->whereNotNull('p.funded_at')
                ->where('f.currency', CatalystCurrencySymbols::ADA->name)
                ->groupBy('chp.community_id');

            // Now join this subquery to the main communities query
            $query = $query->leftJoinSub($awardedAdaSub, 'ada', 'ada.community_id', '=', 'communities.id')
                ->select('communities.*', 'ada.awarded_ada') // or use selectRaw() if needed
                ->whereBetween('ada.awarded_ada', [$awardedAda->first(), $awardedAda->last()]);
        }

        // sort
        if ($this->sortBy && $this->sortOrder) {
            if ($this->sortBy == 'title') {
                $query = $query->orderBy($this->sortBy, $this->sortOrder);
            } else {
                $currency = $this->sortBy == 'amount_awarded_ada'
                    ? CatalystCurrencySymbols::ADA->name
                    : CatalystCurrencySymbols::USD->name;

                $query->addSelect([
                    'communities.*',
                    DB::raw("(
                            SELECT COALESCE(SUM(p.amount_requested), 0)
                            FROM community_has_proposal chp
                            JOIN proposals p ON p.id = chp.proposal_id
                            JOIN funds f ON f.id = p.fund_id
                            WHERE chp.community_id = communities.id
                              AND p.type = 'proposal'
                              AND p.funded_at IS NOT NULL
                              AND f.currency = '".$currency."'
                        ) as awarded_currency"),
                ])->orderBy('awarded_currency', $this->sortOrder);
            }
        }

        $total = $query->count();

        // Get paginated results
        $results = $query->offset(($this->currentPage - 1) * $this->limit)->limit($this->limit)->get();

        // Add membership information if user is authenticated
        if (Auth::check()) {
            $userCommunityIds = Auth::user()->communities()->pluck('communities.id')->toArray();

            $results->each(function ($community) use ($userCommunityIds) {
                $community->is_member = in_array($community->id, $userCommunityIds);
            });
        } else {
            // Set is_member to false for all communities if no user is authenticated
            $results->each(function ($community) {
                $community->is_member = false;
            });
        }

        // Create LengthAwarePaginator instance
        $pagination = new LengthAwarePaginator(CommunityData::collect($results), $total, $this->limit, $this->currentPage, [
            'path' => request()->url(),
            'query' => request()->query(),
        ]);

        return $pagination->onEachSide(0);
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            CommunitySearchParams::FUNDING_STATUS()->value => 'array|nullable',
            CommunitySearchParams::PROJECT_STATUS()->value => 'array|nullable',
            CommunitySearchParams::QUERY()->value => 'string|nullable',
            CommunitySearchParams::PAGE()->value => 'int|nullable',
            CommunitySearchParams::LIMIT()->value => 'int|nullable',
            CommunitySearchParams::SORTS()->value => 'nullable',
            CommunitySearchParams::CAMPAIGNS()->value => 'array|nullable',
            CommunitySearchParams::TAGS()->value => 'array|nullable',
            CommunitySearchParams::IDEASCALE_PROFILES()->value => 'array|nullable',
            CommunitySearchParams::FUNDS()->value => 'array|nullable',
            CommunitySearchParams::PROPOSALS()->value => 'array|nullable',
            CommunitySearchParams::AWARDED_ADA()->value => 'array|nullable',
            CommunitySearchParams::AWARDED_USD()->value => 'array|nullable',
        ]);

        // format sort params for meili
        if (! empty($this->queryParams[CommunitySearchParams::SORTS()->value])) {
            $sort = collect(
                explode(
                    ':',
                    $this->queryParams[ProposalSearchParams::SORTS()->value]
                )
            )->filter();

            $this->sortBy = $sort->first();

            $this->sortOrder = $sort->last();
        }

        $this->currentPage = (int) $request->query(CommunitySearchParams::PAGE()->value) ?? 1;
    }

    public function connections(Request $request, int $id): array
    {
        $community = Community::findOrFail($id);

        $connections = $community->getConnectionsData($request);

        return $connections;
    }

    public function incrementalConnections(Request $request): array
    {
        $hash = $request->get('hash');
        $community = Community::byHash($hash);

        $connections = $community->getIncrementalConnectionsData($request);

        return $connections;
    }

    public function join(Community $community)
    {
        $user = Auth::user();

        if (! $user) {
            return redirect()->route('login')->with('error', 'You must be logged in to join a community.');
        }

        if ($community->users()->where('users.id', $user->id)->exists()) {
            return back()->with('info', 'You are already a member of this community.');
        }

        $community->users()->attach($user->id);

        Cache::forget("community:{$community->id}:full");

        return back()->with('success', 'Successfully joined the community!');
    }

    public function setCounts($query)
    {
        $query = $query->addSelect([
            'communities.*',
            DB::raw("(
                    SELECT COALESCE(SUM(p.amount_requested), 0)
                    FROM community_has_proposal chp
                    JOIN proposals p ON p.id = chp.proposal_id
                    JOIN funds f ON f.id = p.fund_id
                    WHERE chp.community_id = communities.id
                    AND p.type = 'proposal'
                    AND p.funded_at IS NOT NULL
                    AND f.currency = '".CatalystCurrencySymbols::USD->name."'
                ) as awarded_usd"),
        ])->addSelect([
            'communities.*',
            DB::raw("(
                    SELECT COALESCE(SUM(p.amount_requested), 0)
                    FROM community_has_proposal chp
                    JOIN proposals p ON p.id = chp.proposal_id
                    JOIN funds f ON f.id = p.fund_id
                    WHERE chp.community_id = communities.id
                    AND p.type = 'proposal'
                    AND p.funded_at IS NOT NULL
                    AND f.currency = '".CatalystCurrencySymbols::ADA->name."'
                ) as awarded_ada"),
        ]);

        $this->maxAwardedUsd = $query->pluck('awarded_usd')->isNotEmpty() ? max($query->pluck('awarded_usd')->toArray()) : 0;
        $this->maxAwardedAda = $query->pluck('awarded_ada')->isNotEmpty() ? max($query->pluck('awarded_ada')->toArray()) : 0;
        $this->maxProposalsCount = $query->pluck('proposals_count')->isNotEmpty() ? max($query->pluck('proposals_count')->toArray()) : 0;
    }
}
