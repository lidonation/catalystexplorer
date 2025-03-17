<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\CatalystCurrencySymbols;
use App\Enums\CommunitySearchParams;
use App\Enums\ProposalSearchParams;
use App\Http\Controllers\Controller;
use App\Http\Resources\CommunityResource;
use App\Models\Campaign;
use App\Models\Community;
use App\Models\IdeascaleProfile;
use App\Models\Tag;
use App\Services\HashIdService;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Routing\ResponseFactory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Stringable;
use Inertia\Inertia;
use Laravel\Scout\Builder;

class CommunityController extends Controller
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

    public array $tagsCount = [];

    public array $proposalsCount = [];

    public array $totalAwardedAda = [];

    public array $totalAwardedUsd = [];

    public array $fundsCount = [];

    public function index(Request $request): \Inertia\Response
    {

        $this->setCounts();
        $this->getProps($request);

        $props = [
            'filters' => $this->queryParams,
            'filterCounts' => [
                'proposalsCount' => ! empty($this->proposalsCount)
                    ? max($this->proposalsCount)
                    : 0,
                'totalAwardedAda' => ! empty($this->totalAwardedAda)
                    ? max($this->totalAwardedAda)
                    : 0,
                'totalAwardedUsd' => ! empty($this->totalAwardedUsd)
                    ? max($this->totalAwardedUsd)
                    : 0,
            ],
            'communities' => $this->query($request),
        ];

        return Inertia::render('Communities/Index', $props);
    }

    public function query(Request $request)
    {
        $query = Community::query()->with(['proposals.campaign', 'ideascale_profiles'])
            ->withCount('proposals');

        $filters = [
            'search' => $request->input('q', null),
        ];
        $query->filter($filters);

        if (isset($this->queryParams[CommunitySearchParams::PROPOSALS()->value])) {
            $proposalsRange = collect((object) $this->queryParams[ProposalSearchParams::PROPOSALS()->value]);

            $query = DB::query()
                ->fromSub($query->toBase(), 'communities')
                ->whereBetween('proposals_count', [$proposalsRange->first(), $proposalsRange->last()]);
        }

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
            $campaignHashes = $this->queryParams[CommunitySearchParams::CAMPAIGNS()->value];
            $decoded_campaign_ids = (new HashIdService(new Campaign))
                ->decodeArray($campaignHashes);
            $query->whereHas('proposals.campaign', function ($query) use ($decoded_campaign_ids) {
                $query->whereIn('id', $decoded_campaign_ids);
            });
        }

        if (isset($this->queryParams[CommunitySearchParams::IDEASCALE_PROFILES()->value])) {
            $ideascaleProfileHashes = $this->queryParams[CommunitySearchParams::IDEASCALE_PROFILES()->value];
            $decodedIdeascaleProfileIds = (new HashIdService(new IdeascaleProfile))
                ->decodeArray($ideascaleProfileHashes);
            $query->whereHas('ideascale_profiles', function ($query) use ($decodedIdeascaleProfileIds) {
                $query->whereIn('id', $decodedIdeascaleProfileIds);
            });
        }

        if (isset($this->queryParams[CommunitySearchParams::COMMUNITIES()->value])) {
            $communityHashes = $this->queryParams[CommunitySearchParams::COMMUNITIES()->value];
            $decodedCommunityIds = (new HashIdService(new Community))
                ->decodeArray($communityHashes);
            $query->whereIn('id', $decodedCommunityIds);
        }

        if (isset($this->queryParams[CommunitySearchParams::COHORT()->value])) {
            $cohortFilters = $this->queryParams[CommunitySearchParams::COHORT()->value];
            $query->whereHas('proposals.metas', function ($q) use ($cohortFilters) {
                $q->whereIn('key', $cohortFilters)
                    ->where('content', true);
            });
        }

        if (isset($this->queryParams[CommunitySearchParams::TAGS()->value])) {
            $tagsHashes = $this->queryParams[CommunitySearchParams::TAGS()->value];
            $decodedTagsIds = (new HashIdService(new Tag))
                ->decodeArray($tagsHashes);
            $query->whereHas('proposals.tags', function ($query) use ($decodedTagsIds) {
                $query->whereIn('tags.id', $decodedTagsIds);
            });
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

        // Create LengthAwarePaginator instance
        $pagination = new LengthAwarePaginator($results, $total, $this->limit, $this->currentPage, [
            'path' => request()->url(),
            'query' => request()->query(),
        ]);

        return $pagination->onEachSide(1);
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            CommunitySearchParams::FUNDING_STATUS()->value => 'array|nullable',
            CommunitySearchParams::PROJECT_STATUS()->value => 'array|nullable',
            CommunitySearchParams::QUERY()->value => 'string|nullable',
            CommunitySearchParams::COHORT()->value => 'array|nullable',
            CommunitySearchParams::PAGE()->value => 'int|nullable',
            CommunitySearchParams::LIMIT()->value => 'int|nullable',
            CommunitySearchParams::SORTS()->value => 'nullable',
            CommunitySearchParams::CAMPAIGNS()->value => 'array|nullable',
            CommunitySearchParams::TAGS()->value => 'array|nullable',
            CommunitySearchParams::COMMUNITIES()->value => 'array|nullable',
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

    public function community($communityId): \Illuminate\Http\Response|CommunityResource|Application|ResponseFactory
    {
        $community = Community::find($communityId);

        if (is_null($community)) {
            return response([
                'errors' => 'Communities not found',
            ], Response::HTTP_NOT_FOUND);
        } else {
            return new CommunityResource($community);
        }
    }

    public function communities(): Response|AnonymousResourceCollection|Application|ResponseFactory
    {
        $per_page = request('per_page', 24);

        // per_page query doesn't exceed 60
        if ($per_page > 60) {
            return response([
                'status_code' => 60,
                'message' => 'query parameter \'per_page\' should not exceed 60',
            ], 60);
        }

        $communities = Community::query()
            ->filter(request(['search', 'ids']));

        return CommunityResource::collection($communities->fastPaginate($per_page)->onEachSide(0));
    }

    public function connections(Request $request, int $id): array
    {
        $community = Community::findOrFail($id);

        $connections = $community->getConnectionsData($request);

        return $connections;
    }

    public function join($communityHash)
    {
        $community = Community::findOrFail($communityHash);

        $user = auth()->user();

        $community->ideascale_profiles()->attach($user->id);

        return back();
    }

    public function setCounts()
    {
        $query = Community::query()
            ->withCount('proposals')
            ->addSelect([
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

        $this->totalAwardedUsd = $query->pluck('awarded_usd')->toArray();
        $this->totalAwardedAda = $query->pluck('awarded_ada')->toArray();
        $this->proposalsCount = $query->pluck('proposals_count')->toArray();
    }
}
