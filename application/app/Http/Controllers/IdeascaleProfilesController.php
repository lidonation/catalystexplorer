<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\DataTransferObjects\CampaignData;
use App\DataTransferObjects\CommunityData;
use App\DataTransferObjects\GroupData;
use App\DataTransferObjects\IdeascaleProfileData;
use App\DataTransferObjects\ProjectScheduleData;
use App\DataTransferObjects\ProposalData;
use App\DataTransferObjects\ReviewData;
use App\Enums\IdeascaleProfileSearchParams;
use App\Enums\ProposalSearchParams;
use App\Models\Campaign;
use App\Models\Community;
use App\Models\IdeascaleProfile;
use App\Models\Moderation;
use App\Models\ProjectSchedule;
use App\Repositories\IdeascaleProfileRepository;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;
use Staudenmeir\EloquentHasManyDeep\HasManyDeep;

class IdeascaleProfilesController extends Controller
{
    protected int $limit = 24;

    protected int $currentPage = 1;

    protected array $queryParams = [];

    public function index(Request $request): Response
    {
        $this->getProps($request);

        $ideascaleProfiles = $this->query();

        return Inertia::render('IdeascaleProfile/Index', [
            'ideascaleProfilesCount' => 4,
            'ideascaleProfiles' => app()->environment('testing')
                ? $ideascaleProfiles
                : Inertia::defer(fn () => $this->query()),
            'filters' => $this->queryParams,
        ]);
    }

    public function show(Request $request, IdeascaleProfile $ideascaleProfile): Response
    {
        $this->getProps($request);
        $profileId = $ideascaleProfile->id;

        $cacheKey = "ideascale_profile:{$profileId}:base_data";

        $ideascaleProfileData = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($ideascaleProfile) {
            $ideascaleProfile
                ->load(['groups'])
                ->loadCount([
                    'completed_proposals',
                    'funded_proposals',
                    'unfunded_proposals',
                    'proposals',
                    'reviews',
                ])->append([
                    'amount_distributed_ada',
                    'amount_distributed_usd',
                    'amount_awarded_ada',
                    'amount_awarded_usd',
                    'amount_requested_ada',
                    'amount_requested_usd',
                    'aggregated_ratings',
                ]);

            return [
                ...$ideascaleProfile->toArray(),
                'groups' => $ideascaleProfile->groups->toArray(),
            ];
        });

        $currentPage = 1;

        $props = [
            'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfileData),

            'proposals' => Inertia::optional(
                fn () => Cache::remember(
                    "profile:{$profileId}:proposals:page:{$currentPage}",
                    now()->addMinutes(10),
                    fn () => to_length_aware_paginator(
                        ProposalData::collect(
                            $ideascaleProfile->proposals()
                                ->with(['users', 'fund'])
                                ->paginate(11, ['*'], 'p', $currentPage)
                        )
                    )->onEachSide(0)
                )
            ),

            'groups' => Inertia::optional(
                fn () => Cache::remember(
                    "profile:{$profileId}:groups:page:{$currentPage}",
                    now()->addMinutes(10),
                    fn () => to_length_aware_paginator(
                        GroupData::collect(
                            $ideascaleProfile->groups()
                                ->withCount([
                                    'completed_proposals',
                                    'unfunded_proposals',
                                    'funded_proposals',
                                    'proposals',
                                ])
                                ->paginate(12, ['*'], 'p', $currentPage)
                        )
                    )
                )
            ),

            'connections' => Inertia::optional(
                fn () => $ideascaleProfile->connected_items
            ),

            'communities' => Inertia::optional(
                fn () => Cache::remember(
                    "profile:{$profileId}:communities:page:{$currentPage}",
                    now()->addMinutes(10),
                    fn () => CommunityData::collect(
                        to_length_aware_paginator(
                            items: Community::query()
                                ->whereRelation('ideascale_profiles', 'ideascale_profiles.id', $profileId)
                                ->with([
                                    'ideascale_profiles' => fn (HasManyDeep $q) => $q->limit(5),
                                    'ideascale_profiles.media',
                                ])
                                ->withCount(['proposals', 'ideascale_profiles'])
                                ->paginate(12, ['*'], 'p', $currentPage)
                        )
                    )
                )
            ),

            'reviews' => Inertia::optional(
                fn () => Cache::remember(
                    "profile:{$profileId}:reviews:page:{$currentPage}",
                    now()->addMinutes(10),
                    fn () => to_length_aware_paginator(
                        ReviewData::collect(
                            $ideascaleProfile->reviews()
                                ->with(['reviewer.reputation_scores', 'proposal.fund'])
                                ->paginate(11, ['*'], 'p', $currentPage)
                        )
                    )
                )
            ),

            'aggregatedRatings' => Cache::remember(
                "profile:{$profileId}:aggregated_ratings",
                now()->addMinutes(10),
                fn () => $ideascaleProfileData['aggregated_ratings'] ?? []
            ),

            'projectSchedules' => Inertia::optional(
                fn () => Cache::remember(
                    "profile:{$profileId}:project_schedules:page:{$currentPage}",
                    now()->addMinutes(10),
                    fn () => to_length_aware_paginator(
                        ProjectScheduleData::collect(
                            ProjectSchedule::whereHas('proposal', function ($query) use ($profileId) {
                                $query->whereHas('users', fn ($q) => $q->where('ideascale_profile_id', $profileId));
                            })
                                ->with(['milestones'])
                                ->paginate(6, ['*'], 'p', $currentPage)
                        )
                    )
                )
            ),

            'campaigns' => Inertia::optional(
                fn () => Cache::remember(
                    "profile:{$profileId}:campaigns",
                    now()->addMinutes(10),
                    fn () => CampaignData::collect(
                        Campaign::whereIn('id', $ideascaleProfile->proposals()->pluck('campaign_id'))
                            ->withCount([
                                'completed_proposals',
                                'unfunded_proposals',
                                'funded_proposals',
                            ])
                            ->get()
                    )
                )
            ),
        ];

        return match (true) {
            str_contains($request->path(), '/connections') => Inertia::render('IdeascaleProfile/Connections/Index', $props),
            str_contains($request->path(), '/groups') => Inertia::render('IdeascaleProfile/Groups/Index', $props),
            str_contains($request->path(), '/communities') => Inertia::render('IdeascaleProfile/Communities/Index', $props),
            str_contains($request->path(), '/reviews') => Inertia::render('IdeascaleProfile/Reviews/Index', $props),
            str_contains($request->path(), '/milestones') => Inertia::render('IdeascaleProfile/Milestones/Index', $props),
            str_contains($request->path(), '/reports') => Inertia::render('IdeascaleProfile/Reports/Index', $props),
            str_contains($request->path(), '/campaigns') => Inertia::render('IdeascaleProfile/Campaigns/Index', $props),
            default => Inertia::render('IdeascaleProfile/Proposals/Index', $props),
        };
    }

    public function getReviewsData(IdeascaleProfile $ideascaleProfile, string $path): array
    {
        $proposals = $ideascaleProfile->own_proposals()
            ->with([
                'reviews' => function ($query) {
                    $query->where('status', 'published')
                        ->with([
                            'user' => function ($q) {
                                $q->withCount('reviews');
                            },
                            'rating:review_id,rating',
                        ]);
                },
            ])
            ->get();

        $reviews = $proposals->flatMap(fn ($proposal) => $proposal->reviews);
        $reviewerIds = $reviews->pluck('user.id')->filter()->unique()->values();

        $reviewIds = $reviews->pluck('id')->toArray();

        $moderations = Moderation::whereIn('review_id', $reviewIds)
            ->with('reviewer.reputationScores')
            ->get()
            ->keyBy('review_id');

        $reviewerProfiles = IdeascaleProfile::whereIn('claimed_by_id', $reviewerIds)->get();

        $ratingStats = array_fill_keys([1, 2, 3, 4, 5], 0);

        foreach ($reviews as $review) {
            $rating = $review->rating->rating ?? null;
            if (isset($rating) && isset($ratingStats[$rating])) {
                $ratingStats[$rating]++;
            }
        }

        $page = (int) ($this->queryParams[IdeascaleProfileSearchParams::PAGE()->value] ?? $this->currentPage);
        $perPage = 10;
        $reviewsPaginator = new LengthAwarePaginator(
            $reviews->forPage($page, $perPage)->values(),
            $reviews->count(),
            $perPage,
            $page,
            ['path' => $path]
        );

        $allReputationScores = collect();

        $formattedReviews = $reviewsPaginator->through(function ($review) use ($reviewerProfiles, $moderations, &$allReputationScores) {
            $userId = $review->user->id ?? null;
            $userProfile = $userId ? $reviewerProfiles->firstWhere('claimed_by_id', $userId) : null;

            $moderation = $moderations->get($review->id);

            $reputationScores = collect();
            if ($moderation && $moderation->reviewer) {
                $reputationScores = $moderation->reviewer->reputationScores;
                $allReputationScores = $allReputationScores->merge($reputationScores);
            }

            return [
                'review' => ReviewData::from($review),
                'reviewerReviewsCount' => $review->user->reviews_count ?? 0,
                'rating' => $review->rating->rating ?? null,
                'reviewerProfile' => IdeascaleProfileData::from($userProfile),
                'reputationScores' => $reputationScores,
            ];
        })->toArray();

        return [
            'reviews' => $formattedReviews,
            'ratingStats' => $ratingStats,
            'reputationScores' => $allReputationScores,
        ];
    }

    protected function query($returnBuilder = false, $attrs = null, $filters = [])
    {
        $page = (int) ($this->queryParams[IdeascaleProfileSearchParams::PAGE()->value] ?? $this->currentPage);
        $limit = (int) ($this->queryParams[IdeascaleProfileSearchParams::LIMIT()->value] ?? $this->limit);
        $sort = ($this->queryParams[IdeascaleProfileSearchParams::SORT()->value] ?? null);

        $args = [
            'filter' => $this->getUserFilters(),
            'offset' => ($page - 1) * $limit,
            'limit' => $limit,
            'attributesToRetrieve' => $attrs ?? [
                'id',
                'name',
                'hero_img_url',
                'first_timer',
                'claimed_by_id',
                'completed_proposals_count',
                'funded_proposals_count',
                'unfunded_proposals_count',
                'proposals_count',
                'collaborating_proposals_count',
                'own_proposals_count',
                'amount_awarded_ada',
                'amount_awarded_usd',
                'proposals_funded',
                'proposals_total_amount_requested',
            ],
        ];

        if ($sort) {
            $args['sort'] = [$sort];
        }

        $proposals = app(IdeascaleProfileRepository::class);

        $builder = $proposals->search(
            $this->queryParams[IdeascaleProfileSearchParams::QUERY()->value] ?? '',
            $args
        );

        $response = new Fluent($builder->raw());

        $items = collect($response->hits);

        $pagination = new LengthAwarePaginator(
            (new TransformIdsToHashes)(
                collection: $items,
                model: new IdeascaleProfile
            )->toArray(),
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

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            ProposalSearchParams::FUNDS()->value => 'array|nullable',
            ProposalSearchParams::PROJECT_STATUS()->value => 'array|nullable',
            ProposalSearchParams::TAGS()->value => 'array|nullable',
            ProposalSearchParams::FUNDING_STATUS()->value => 'array|nullable',
            ProposalSearchParams::BUDGETS()->value => 'array|nullable',
            ProposalSearchParams::PAGE()->value => 'int|nullable',
            ProposalSearchParams::LIMIT()->value => 'int|nullable',

            IdeascaleProfileSearchParams::QUERY()->value => 'string|nullable',
            IdeascaleProfileSearchParams::SORT()->value => 'string|nullable',
        ]);
    }

    protected function getUserFilters(): array
    {
        $filters = [];

        try {
            // Fund filter
            if (! empty($this->queryParams[ProposalSearchParams::FUNDS()->value])) {
                $funds = implode("','", $this->queryParams[ProposalSearchParams::FUNDS()->value]);
                $filters[] = "proposals.fund.hash IN ['{$funds}']";
            }

            // Project status filter
            if (isset($this->queryParams[ProposalSearchParams::PROJECT_STATUS()->value])) {
                $projectStatuses = implode(',', $this->queryParams[ProposalSearchParams::PROJECT_STATUS()->value]);
                $filters[] = "proposals.status IN [{$projectStatuses}]";
            }

            // Tags filter
            if (! empty($this->queryParams[ProposalSearchParams::TAGS()->value])) {
                $tagIds = array_map('intval', $this->queryParams[ProposalSearchParams::TAGS()->value]);
                $filters[] = '('.implode(' OR ', array_map(fn ($t) => "proposals.tags.id = {$t}", $tagIds)).')';
            }

            // Funding status filter
            if (isset($this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value])) {
                $fundingStatus = implode(',', $this->queryParams[ProposalSearchParams::FUNDING_STATUS()->value]);
                $filters[] = "proposals.funding_status = '{$fundingStatus}'";
            }

            // filter by budget range
            if (! empty($this->queryParams[ProposalSearchParams::BUDGETS()->value])) {
                $budgetRange = collect((object) $this->queryParams[ProposalSearchParams::BUDGETS()->value]);
                $filters[] = "(proposals_total_amount_requested  {$budgetRange->first()} TO  {$budgetRange->last()})";
            }
        } catch (\Exception $e) {
            Log::error('Error generating filters:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        return $filters;
    }
}
