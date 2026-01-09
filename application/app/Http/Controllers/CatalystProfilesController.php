<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\CampaignData;
use App\DataTransferObjects\CatalystProfileData;
use App\DataTransferObjects\CommunityData;
use App\DataTransferObjects\GroupData;
use App\DataTransferObjects\ProposalData;
use App\Enums\IdeascaleProfileSearchParams;
use App\Enums\ProposalSearchParams;
use App\Models\Campaign;
use App\Models\CatalystProfile;
use App\Models\Community;
use App\Repositories\CatalystProfileRepository;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Fluent;
use Inertia\Inertia;
use Inertia\Response;
use Staudenmeir\EloquentHasManyDeep\HasManyDeep;

class CatalystProfilesController extends Controller
{
    protected int $limit = 24;

    protected int $currentPage = 1;

    protected array $queryParams = [];

    public function index(Request $request): Response
    {
        $this->getProps($request);

        $catalystProfiles = $this->query();

        return Inertia::render('CatalystProfile/Index', [
            'catalystProfilesCount' => 4,
            'catalystProfiles' => app()->environment('testing')
                ? $catalystProfiles
                : Inertia::defer(fn () => $this->query()),
            'filters' => $this->queryParams,
        ]);
    }

    public function show(Request $request, CatalystProfile $catalystProfile): Response
    {
        $this->getProps($request);
        $profileId = $catalystProfile->id;

        $cacheKey = "catalyst_profile:{$profileId}:base_data";
        $catalystProfileData = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($catalystProfile) {
            $catalystProfile->load(['groups']);

            return [
                ...$catalystProfile->toArray(),
                'groups' => $catalystProfile->groupsUuid->toArray(),
            ];
        });

        $currentPage = 1;

        $props = [
            'catalystProfile' => CatalystProfileData::from($catalystProfileData),

            'proposals' => Inertia::optional(
                fn () => Cache::remember(
                    "catalyst_profile:{$profileId}:proposals:page:{$currentPage}",
                    now()->addMinutes(10),
                    fn () => to_length_aware_paginator(
                        ProposalData::collect(
                            $catalystProfile->proposals()
                                ->with(['users', 'fund'])
                                ->paginate(11, ['*'], 'p', $currentPage)
                        )
                    )->onEachSide(0)
                )
            ),

            'groups' => Inertia::optional(
                fn () => Cache::remember(
                    "catalyst_profile:{$profileId}:groups:page:{$currentPage}",
                    now()->addMinutes(10),
                    fn () => to_length_aware_paginator(
                        GroupData::collect(
                            $catalystProfile->groupsUuid()
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
                fn () => $catalystProfile->connected_items
            ),

            'communities' => Inertia::optional(
                fn () => Cache::remember(
                    "catalyst_profile:{$profileId}:communities:page:{$currentPage}",
                    now()->addMinutes(10),
                    fn () => CommunityData::collect(
                        to_length_aware_paginator(
                            items: Community::query()
                                ->whereRelation('catalyst_profiles', 'catalyst_profiles.id', $profileId)
                                ->with([
                                    'catalyst_profiles' => fn (HasManyDeep $q) => $q->limit(5),
                                    'catalyst_profiles.media',
                                ])
                                ->withCount(['proposals', 'catalyst_profiles'])
                                ->paginate(12, ['*'], 'p', $currentPage)
                        )
                    )
                )
            ),

            'campaigns' => Inertia::optional(
                fn () => Cache::remember(
                    "catalyst_profile:{$profileId}:campaigns",
                    now()->addMinutes(10),
                    fn () => CampaignData::collect(
                        Campaign::whereIn('id', $catalystProfile->proposals()->pluck('campaign_id'))
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
            str_contains($request->path(), '/connections') => Inertia::render('CatalystProfile/Connections/Index', $props),
            str_contains($request->path(), '/groups') => Inertia::render('CatalystProfile/Groups/Index', $props),
            str_contains($request->path(), '/communities') => Inertia::render('CatalystProfile/Communities/Index', $props),
            str_contains($request->path(), '/campaigns') => Inertia::render('CatalystProfile/Campaigns/Index', $props),
            default => Inertia::render('CatalystProfile/Proposals/Index', $props),
        };
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
                'username',
                'catalyst_id',
                'claimed_by',
                'hero_img_url',
                'proposals_count',
            ],
        ];

        if ($sort) {
            $args['sort'] = [$sort];
        }

        $profiles = app(CatalystProfileRepository::class);

        $builder = $profiles->search(
            $this->queryParams[IdeascaleProfileSearchParams::QUERY()->value] ?? '',
            $args
        );

        $response = new Fluent($builder->raw());

        $items = collect($response->hits);

        $pagination = new LengthAwarePaginator(
            $items->toArray(),
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
                $filters[] = "proposals.fund.id IN ['{$funds}']";
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
