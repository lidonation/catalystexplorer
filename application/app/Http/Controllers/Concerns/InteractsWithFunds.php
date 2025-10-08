<?php

declare(strict_types=1);

namespace App\Http\Controllers\Concerns;

use App\DataTransferObjects\CatalystTallyData;
use App\Enums\CampaignsSortBy;
use App\Enums\ProposalSearchParams;
use App\Models\Campaign;
use App\Models\CatalystProfile;
use App\Models\CatalystTally;
use App\Models\Fund;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use Illuminate\Http\Request;

trait InteractsWithFunds
{
    protected array $queryParams = [];

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
    }

    /**
     * @return array{0: Fund, 1: \Illuminate\Support\Collection}
     */
    protected function resolveSelectedFund(Request $request): array
    {
        $fundsQuery = Fund::query()
            ->whereHas('snapshots')
            ->withCount(['funded_proposals', 'completed_proposals', 'unfunded_proposals', 'proposals'])
            ->orderBy('launched_at', 'desc');

        $fundIdParam = $request->input(ProposalSearchParams::FUNDS()->value);
        $fundId = null;

        if (is_array($fundIdParam) && count($fundIdParam) > 0) {
            $fundId = (int) $fundIdParam[0];
        } elseif ($fundIdParam !== null) {
            $fundId = (int) $fundIdParam;
        }

        if ($fundId) {
            $selectedFund = (clone $fundsQuery)->find($fundId);
        } else {
            $selectedFund = (clone $fundsQuery)->first();
        }

        if (! $selectedFund) {
            $selectedFund = (clone $fundsQuery)->firstOrFail();
        }

        $allFunds = Fund::query()
            ->whereHas('snapshots')
            ->orderBy('launched_at', 'desc')
            ->get(['id', 'title', 'amount']);

        return [$selectedFund, $allFunds];
    }

    protected function getCampaigns(Fund $fund)
    {
        $sortParam = $this->queryParams[ProposalSearchParams::SORTS()->value] ?? null;
        $sortField = null;
        $sortDirection = null;

        if ($sortParam) {
            [$sortField, $sortDirection] = explode(':', $sortParam);
        }

        $query = $fund->campaigns()
            ->withCount([
                'completed_proposals',
                'unfunded_proposals',
                'funded_proposals',
            ]);

        if ($sortField && $sortDirection && in_array($sortDirection, ['asc', 'desc'], true)) {
            if ($sortField === CampaignsSortBy::AMOUNT()->value) {
                $query->orderBy(CampaignsSortBy::AMOUNT()->value, $sortDirection);
            } elseif ($sortField === CampaignsSortBy::PROPOSALSCOUNT()->value) {
                $query->orderBy(CampaignsSortBy::PROPOSALSCOUNT()->value, $sortDirection);
            }
        }

        return $query->get();
    }

    protected function getTallies(Fund $fund, int $perPage = 10, int $page = 1): array
    {
        try {
            $filterHash = hash('sha256', serialize([
                'search' => $this->queryParams[ProposalSearchParams::QUERY()->value] ?? null,
                'sort' => $this->queryParams[ProposalSearchParams::SORTS()->value] ?? null,
                'campaigns' => $this->queryParams[ProposalSearchParams::CAMPAIGNS()->value] ?? null,
                'funds' => $this->queryParams[ProposalSearchParams::FUNDS()->value] ?? null,
            ]));
            $cacheKey = $this->buildTalliesCacheKey($fund->id, $page, $perPage).'_'.$filterHash;

            $cached = \Cache::get($cacheKey);
            if ($cached && ! app()->environment('local')) {
                return $cached;
            }

            $searchQuery = $this->queryParams[ProposalSearchParams::QUERY()->value] ?? null;
            $sortParam = $this->queryParams[ProposalSearchParams::SORTS()->value] ?? null;
            $campaignFilter = $this->queryParams[ProposalSearchParams::CAMPAIGNS()->value] ?? null;
            $fundFilter = $this->queryParams[ProposalSearchParams::FUNDS()->value] ?? null;

            $sortField = 'tally';
            $sortDirection = 'desc';
            $sortTable = 'catalyst_tallies';
            if ($sortParam) {
                [$sortField, $sortDirection] = explode(':', $sortParam);
                if ($sortField === 'votes_count') {
                    $sortField = 'tally';
                    $sortTable = 'catalyst_tallies';
                } elseif ($sortField === 'amount_requested') {
                    $sortField = 'amount_requested';
                    $sortTable = 'proposals';
                }
            }

            $targetFundIds = ! empty($fundFilter) && is_array($fundFilter) ? $fundFilter : [$fund->id];

            $cacheKeySuffix = count($targetFundIds) === 1 ? $targetFundIds[0] : hash('sha256', implode(',', $targetFundIds));
            $totalVotesCast = \Cache::remember(
                "funds_{$cacheKeySuffix}_total_votes",
                now()->addHours(2),
                fn () => CatalystTally::whereIn('context_id', $targetFundIds)->sum('tally')
            );

            $baseQuery = CatalystTally::query()
                ->select([
                    'catalyst_tallies.*',
                    'catalyst_tallies.category_rank',
                    'catalyst_tallies.fund_rank',
                    'catalyst_tallies.overall_rank',
                    'catalyst_tallies.chance_approval',
                    'catalyst_tallies.chance_funding',
                    'proposals.id as proposal_id',
                    'proposals.title as proposal_title',
                    'proposals.slug as proposal_slug',
                    'proposals.amount_requested',
                    'proposals.currency as proposal_currency',
                    'proposals.funding_status as proposal_funding_status',
                    'proposals.campaign_id',
                    'campaigns.id as campaign_id',
                    'campaigns.title as campaign_title',
                    'funds.id as fund_id',
                    'funds.title as fund_title',
                    'funds.currency as fund_currency',
                ])
                ->join('proposals', 'catalyst_tallies.model_id', '=', 'proposals.id')
                ->join('campaigns', 'proposals.campaign_id', '=', 'campaigns.id')
                ->join('funds', 'catalyst_tallies.context_id', '=', 'funds.id')
                ->whereIn('catalyst_tallies.context_id', $targetFundIds)
                ->whereNotNull('catalyst_tallies.model_id');

            if (! empty($campaignFilter) && is_array($campaignFilter)) {
                $baseQuery->whereIn('campaigns.id', $campaignFilter);
            }

            if (! empty($searchQuery)) {
                $searchTerm = trim($searchQuery);

                $baseQuery->where(function ($query) use ($searchTerm) {
                    $query->where('proposals.title', 'ILIKE', "%{$searchTerm}%")
                        ->orWhere('campaigns.title', 'ILIKE', "%{$searchTerm}%");

                    if (strlen($searchTerm) > 3) {
                        $query->orWhereExists(function ($subQuery) use ($searchTerm) {
                            $subQuery->select('*')
                                ->from('proposal_profiles')
                                ->join('catalyst_profiles', 'proposal_profiles.profile_id', '=', 'catalyst_profiles.id')
                                ->whereColumn('proposal_profiles.proposal_id', 'proposals.id')
                                ->where('proposal_profiles.profile_type', CatalystProfile::class)
                                ->where(function ($nameQuery) use ($searchTerm) {
                                    $nameQuery->where('catalyst_profiles.name', 'ILIKE', "%{$searchTerm}%")
                                        ->orWhere('catalyst_profiles.username', 'ILIKE', "%{$searchTerm}%");
                                });
                        })
                            ->orWhereExists(function ($subQuery) use ($searchTerm) {
                                $subQuery->select('*')
                                    ->from('proposal_profiles')
                                    ->join('ideascale_profiles', 'proposal_profiles.profile_id', '=', 'ideascale_profiles.id')
                                    ->whereColumn('proposal_profiles.proposal_id', 'proposals.id')
                                    ->where('proposal_profiles.profile_type', IdeascaleProfile::class)
                                    ->where(function ($nameQuery) use ($searchTerm) {
                                        $nameQuery->where('ideascale_profiles.name', 'ILIKE', "%{$searchTerm}%")
                                            ->orWhere('ideascale_profiles.username', 'ILIKE', "%{$searchTerm}%");
                                    });
                            });
                    }
                });
            }

            $offset = ($page - 1) * $perPage;

            $talliesQuery = (clone $baseQuery)
                ->orderBy("{$sortTable}.{$sortField}", $sortDirection)
                ->orderBy('catalyst_tallies.id', 'asc')
                ->offset($offset)
                ->limit($perPage);

            $totalCount = $baseQuery->count('catalyst_tallies.id');

            if ($totalCount === 0) {
                return $this->getEmptyTalliesResponse($perPage, $page, $totalVotesCast);
            }

            $talliesWithRanking = $talliesQuery->get();

            $currentLocale = \App::getLocale();

            $talliesWithRanking->each(function ($tally) use ($fund, $currentLocale) {
                if ($tally->proposal_id) {
                    $proposal = new Proposal;
                    $proposal->id = $tally->proposal_id;

                    $proposal->title = $this->getTranslatedTitle($tally->proposal_title, $currentLocale);
                    $proposal->slug = $tally->proposal_slug;

                    $proposal->amount_requested = $tally->amount_requested;
                    $proposal->currency = $tally->proposal_currency;
                    $proposal->funding_status = $tally->proposal_funding_status;
                    $proposal->campaign_id = $tally->campaign_id;

                    if ($tally->campaign_id) {
                        $campaign = new Campaign;
                        $campaign->id = $tally->campaign_id;
                        $campaign->title = $this->getTranslatedTitle($tally->campaign_title, $currentLocale);

                        $proposal->setRelation('campaign', $campaign);
                    }

                    $tally->setRelation('proposal', $proposal);
                }

                $fundModel = new Fund;
                $fundModel->id = $fund->id;
                $fundModel->title = $fund->title;
                $fundModel->currency = $fund->currency;
                $tally->setRelation('fund', $fundModel);
            });

            $lastUpdated = $talliesWithRanking->max('updated_at') ?? null;

            $result = [
                ...(to_length_aware_paginator(
                    CatalystTallyData::collect($talliesWithRanking),
                    total: $totalCount,
                    perPage: $perPage,
                    currentPage: $page
                )->onEachSide(0)->toArray()),
                'total' => $totalCount,
                'total_votes_cast' => $totalVotesCast,
                'last_updated' => $lastUpdated->toISOString(),
            ];

            if (! app()->environment('local')) {
                \Cache::put($cacheKey, $result, now()->addMinutes(5));
            }

            return $result;
        } catch (\Throwable $e) {
            \Log::error('Error fetching tallies', [
                'fund_id' => $fund->id,
                'page' => $page,
                'per_page' => $perPage,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->getEmptyTalliesResponse($perPage, $page, 0);
        }
    }

    protected function getEmptyTalliesResponse(int $perPage, int $page, int $totalVotesCast): array
    {
        return [
            'data' => [],
            'total' => 0,
            'total_votes_cast' => $totalVotesCast,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => 1,
            'from' => 0,
            'to' => 0,
            'prev_page_url' => null,
            'next_page_url' => null,
            'links' => [],
        ];
    }

    protected function buildPaginationUrl(int $page, array $queryParams): string
    {
        $params = array_merge($queryParams, ['p' => $page]);

    return request()->url().'?'.http_build_query($params);
    }

    protected function generatePaginationLinks(int $currentPage, int $lastPage, array $queryParams = []): array
    {
        $links = [];

        $links[] = [
            'url' => $currentPage > 1 ? $this->buildPaginationUrl($currentPage - 1, $queryParams) : null,
            'label' => '&laquo; Previous',
            'active' => false,
        ];

        $start = max(1, $currentPage - 2);
        $end = min($lastPage, $currentPage + 2);

        if ($start > 1) {
            $links[] = [
                'url' => $this->buildPaginationUrl(1, $queryParams),
                'label' => '1',
                'active' => false,
            ];
            if ($start > 2) {
                $links[] = [
                    'url' => null,
                    'label' => '...',
                    'active' => false,
                ];
            }
        }

        for ($i = $start; $i <= $end; $i++) {
            $links[] = [
                'url' => $this->buildPaginationUrl($i, $queryParams),
                'label' => (string) $i,
                'active' => $i === $currentPage,
            ];
        }

        if ($end < $lastPage) {
            if ($end < $lastPage - 1) {
                $links[] = [
                    'url' => null,
                    'label' => '...',
                    'active' => false,
                ];
            }
            $links[] = [
                'url' => $this->buildPaginationUrl($lastPage, $queryParams),
                'label' => (string) $lastPage,
                'active' => false,
            ];
        }

        $links[] = [
            'url' => $currentPage < $lastPage ? $this->buildPaginationUrl($currentPage + 1, $queryParams) : null,
            'label' => 'Next &raquo;',
            'active' => false,
        ];

        return $links;
    }

    protected function buildTalliesCacheKey($fundId, int $page, int $perPage): string
    {
        return "fund_{$fundId}_tallies_page_{$page}_per_{$perPage}";
    }

    protected function getTranslatedTitle(?string $title, string $locale = 'en'): ?string
    {
        if (empty($title)) {
            return $title;
        }

        if (str_starts_with($title, '{') && str_ends_with($title, '}')) {
            try {
                $translations = json_decode($title, true);

                if (is_array($translations)) {
                    return $translations[$locale] ?? $translations['en'] ?? reset($translations) ?? $title;
                }
            } catch (\Throwable) {
                return $title;
            }
        }

        return $title;
    }
}
