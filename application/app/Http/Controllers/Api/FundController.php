<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FundResource;
use App\Models\Fund;
use App\QueryBuilders\Sorts\ProjectLengthSort;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedInclude;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * @group Funds & Campaigns
 *
 * APIs for managing and retrieving Project Catalyst funding rounds and campaigns. Funds represent major funding cycles in the Catalyst ecosystem.
 */
class FundController extends Controller
{
    /**
     * List funds
     *
     * Retrieve a paginated list of Project Catalyst funding rounds with filtering, sorting, and relationship includes.
     *
     * @queryParam page integer The page number for pagination. Example: 1
     * @queryParam per_page integer Number of funds per page (max 60). Example: 24
     * @queryParam filter[ids] integer[] Filter by specific fund IDs. Example: 10,11,12
     * @queryParam filter[title] string Search funds by title (partial match). Example: Fund 12
     * @queryParam filter[status] string Filter by fund status. Example: completed
     * @queryParam filter[currency] string Filter by currency. Example: ADA
     * @queryParam filter[launched_after] string Filter funds launched after this date (ISO 8601). Example: 2024-01-01
     * @queryParam filter[launched_before] string Filter funds launched before this date (ISO 8601). Example: 2024-12-31
     * @queryParam filter[amount_min] integer Filter by minimum fund amount (in ADA lovelace). Example: 1000000000
     * @queryParam filter[amount_max] integer Filter by maximum fund amount (in ADA lovelace). Example: 10000000000
     * @queryParam include string Comma-separated list of relationships to include (proposals,campaigns,funded_proposals,completed_proposals). Example: proposals,campaigns
     * @queryParam sort string Comma-separated list of fields to sort by. Prefix with - for descending order. Available: title,status,amount,launched_at,awarded_at,created_at,updated_at. Example: -launched_at,title
     *
     * @response 200 {
     *   "data": [
     *     {
     *       "id": 12,
     *       "title": "Fund 12",
     *       "status": "completed",
     *       "amount": 50000000000,
     *       "currency": "ADA",
     *       "launched_at": "2024-01-15T00:00:00Z",
     *       "awarded_at": "2024-03-15T00:00:00Z",
     *       "proposals_count": 420,
     *       "funded_proposals_count": 89,
     *       "completed_proposals_count": 72,
     *       "campaigns_count": 12
     *     }
     *   ],
     *   "links": {
     *     "first": "https://api.catalystexplorer.com/api/v1/funds?page=1",
     *     "last": "https://api.catalystexplorer.com/api/v1/funds?page=3",
     *     "prev": null,
     *     "next": "https://api.catalystexplorer.com/api/v1/funds?page=2"
     *   },
     *   "meta": {
     *     "current_page": 1,
     *     "per_page": 24,
     *     "total": 12
     *   }
     * }
     *
     * @unauthenticated
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $per_page = $request->get('per_page', 24);

        // per_page query doesn't exceed 60
        if ($per_page > 60) {
            $per_page = 60;
        }

        $funds = QueryBuilder::for(Fund::class)
            ->allowedFilters([
                AllowedFilter::callback('ids', function ($query, $value) {
                    $ids = is_array($value) ? $value : [$value];
                    $query->whereIn('id', $ids);
                }),
                AllowedFilter::partial('title'),
                AllowedFilter::exact('status'),
                AllowedFilter::exact('currency'),
                AllowedFilter::callback('launched_after', function ($query, $value) {
                    $query->where('launched_at', '>=', $value);
                }),
                AllowedFilter::callback('launched_before', function ($query, $value) {
                    $query->where('launched_at', '<=', $value);
                }),
                AllowedFilter::callback('amount_min', function ($query, $value) {
                    $query->where('amount', '>=', $value);
                }),
                AllowedFilter::callback('amount_max', function ($query, $value) {
                    $query->where('amount', '<=', $value);
                }),
            ])
            ->allowedIncludes([
                AllowedInclude::relationship('proposals'),
                AllowedInclude::relationship('campaigns'),
                AllowedInclude::relationship('funded_proposals'),
                AllowedInclude::relationship('completed_proposals'),
            ])
            ->allowedSorts([
                AllowedSort::field('title'),
                AllowedSort::field('status'),
                AllowedSort::field('amount'),
                AllowedSort::field('launched_at'),
                AllowedSort::field('awarded_at'),
                AllowedSort::field('created_at'),
                AllowedSort::field('updated_at'),
            ])
            ->defaultSort('-launched_at')
            ->withCount(['proposals', 'funded_proposals', 'completed_proposals', 'campaigns'])
            ->paginate($per_page);

        return FundResource::collection($funds);
    }

    /**
     * Display the specified fund with optional includes.
     */
    public function show(Request $request, string $id): FundResource
    {
        $fund = QueryBuilder::for(Fund::class)
            ->allowedIncludes([
                AllowedInclude::relationship('proposals'),
                AllowedInclude::relationship('campaigns'),
                AllowedInclude::relationship('funded_proposals'),
                AllowedInclude::relationship('completed_proposals'),
            ])
            ->withCount(['proposals', 'funded_proposals', 'completed_proposals', 'campaigns'])
            ->findOrFail($id);

        return new FundResource($fund);
    }

    /**
     * Get paginated proposals for a specific fund.
     */
    public function proposals(Request $request, string $id): AnonymousResourceCollection
    {
        $per_page = $request->get('per_page', 24);

        // per_page query doesn't exceed 60
        if ($per_page > 60) {
            $per_page = 60;
        }

        $fund = Fund::findOrFail($id);

        $proposals = QueryBuilder::for($fund->proposals())
            ->allowedFilters([
                AllowedFilter::exact('status'),
                AllowedFilter::exact('category'),
                AllowedFilter::exact('campaign_id'),
                AllowedFilter::partial('title'),
                AllowedFilter::scope('funded', 'whereNotNull', 'funded_at'),
                AllowedFilter::callback('amount_min', function ($query, $value) {
                    $query->where('amount_requested', '>=', $value);
                }),
                AllowedFilter::callback('amount_max', function ($query, $value) {
                    $query->where('amount_requested', '<=', $value);
                }),
            ])
            ->allowedIncludes([
                AllowedInclude::relationship('campaign'),
                AllowedInclude::relationship('team'),
                AllowedInclude::relationship('schedule'),
                AllowedInclude::relationship('schedule.milestones'),
            ])
            ->allowedSorts([
                AllowedSort::field('title'),
                AllowedSort::field('status'),
                AllowedSort::field('amount_requested'),
                AllowedSort::field('amount_received'),
                AllowedSort::custom('project_length', new ProjectLengthSort),
                AllowedSort::field('yes_votes_count'),
                AllowedSort::field('no_votes_count'),
                AllowedSort::field('funded_at'),
                AllowedSort::field('created_at'),
            ])
            ->defaultSort('-created_at')
            ->paginate($per_page);

        return \App\Http\Resources\ProposalResource::collection($proposals);
    }

    /**
     * Legacy endpoint for backwards compatibility
     */
    public function funds(): AnonymousResourceCollection
    {
        return $this->index(request());
    }
}
