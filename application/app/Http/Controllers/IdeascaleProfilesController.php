<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\TransformIdsToHashes;
use App\DataTransferObjects\CampaignData;
use App\DataTransferObjects\IdeascaleProfileData;
use App\DataTransferObjects\ProposalData;
use App\DataTransferObjects\ProposalMilestoneData;
use App\DataTransferObjects\ReviewData;
use App\Enums\IdeascaleProfileSearchParams;
use App\Enums\ProposalSearchParams;
use App\Models\Campaign;
use App\Models\Fund;
use App\Models\IdeascaleProfile;
use App\Models\ReviewerReputationScore;
use App\Models\Reviewer;
use App\Models\Moderation;
use App\Models\ProposalMilestone;
use App\Repositories\IdeascaleProfileRepository;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;

class IdeascaleProfilesController extends Controller
{
    protected int $limit = 40;

    protected int $currentPage = 1;

    protected array $queryParams = [];

    public function index(Request $request): Response
    {
        $this->getProps($request);

        return Inertia::render('IdeascaleProfile/Index', [
            'ideascaleProfilesCount' => 4,
            'ideascaleProfiles' => Inertia::defer(fn () => $this->query()),
            'filters' => $this->queryParams,
        ]);
    }

    public function show(Request $request, IdeascaleProfile $ideascaleProfile): Response
    {
        $this->getProps($request);

        $ideascaleProfile
            ->load(['groups'])
            ->loadCount([
                'completed_proposals',
                'funded_proposals',
                'unfunded_proposals',
                'proposals',
            ])->append([
                'amount_distributed_ada',
                'amount_distributed_usd',
                'amount_awarded_ada',
                'amount_awarded_usd',
                'amount_requested_ada',
                'amount_requested_usd',
            ]);

        $ideascaleProfileData = [
            ...$ideascaleProfile->toArray(),
            'groups' => $ideascaleProfile->groups->toArray(),
        ];

        $path = $request->path();

        if (str_contains($path, '/proposals')) {
            return Inertia::render('IdeascaleProfile/Proposals/Index', [
                'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfileData),
                'proposals' => Inertia::optional(
                    fn () => to_length_aware_paginator(
                        ProposalData::collect(
                            $ideascaleProfile->proposals()
                                ->with(['users', 'fund'])
                                ->paginate(11, ['*'], 'p')
                        )
                    )->onEachSide(0)
                ),
            ]);
        }

        if (str_contains($path, '/connections')) {
            return Inertia::render('IdeascaleProfile/Connections/Index', [
                'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfileData),
                'connections' => Inertia::lazy(fn () => $ideascaleProfile->connected_items), // Use lazy loading
            ]);
        }

        if (str_contains($path, '/groups')) {
            return Inertia::render('IdeascaleProfile/Groups/Index', [
                'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfileData),
            ]);
        }

        if (str_contains($path, '/communities')) {
            return Inertia::render('IdeascaleProfile/Communities/Index', [
                'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfileData),
            ]);
        }

        if (str_contains($path, '/reviews')) {
            $data = $this->getReviewsData($ideascaleProfile, $path);

            return Inertia::render('IdeascaleProfile/Reviews/Index', [
                'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfileData),
                'reviews' => $data['reviews'],
                'ratingStats' => $data['ratingStats'],
                'reputationScores' => $data['reputationScores'],
                'filters' => $this->queryParams,
            ]);
        }

        if (str_contains($path, '/milestones')) {
            return Inertia::render('IdeascaleProfile/Milestones/Index', [
                'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfileData),
                'proposalMilestones' => Inertia::optional(fn () => to_length_aware_paginator(ProposalMilestoneData::collect(
                    ProposalMilestone::whereHas('proposal', function ($query) use ($ideascaleProfile) {
                        $query->has('users', $ideascaleProfile->id);
                    })->with(['milestones'])->paginate(6)
                ))),
            ]);
        }

        if (str_contains($path, '/reports')) {
            return Inertia::render('IdeascaleProfile/Reports/Index', [
                'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfileData),
            ]);
        }

        if (str_contains($path, '/cam')) {
            return Inertia::render('IdeascaleProfile/Campaigns/Index', [
                'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfileData),
                'campaigns' => CampaignData::collect(
                    Campaign::whereIn('id', $ideascaleProfile->proposals()->pluck('campaign_id'))->withCount([
                        'completed_proposals',
                        'unfunded_proposals',
                        'funded_proposals',
                    ])
                        ->get()
                ),
            ]);
        }

        return Inertia::render('IdeascaleProfile/Proposals/Index', [
            'ideascaleProfile' => IdeascaleProfileData::from($ideascaleProfileData),
            'proposals' => Inertia::optional(
                fn () => to_length_aware_paginator(
                    ProposalData::collect(
                        $ideascaleProfile->proposals()
                            ->with(['users', 'fund'])
                            ->paginate(11, ['*'], 'p')
                    )
                )->onEachSide(0)
            ),
            'groups' => $ideascaleProfile->groups(),
        ]);
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
                $filters[] = "proposals.fund.title IN ['{$funds}']";
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
