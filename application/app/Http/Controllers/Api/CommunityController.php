<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\CommunityData;
use App\Http\Controllers\Controller;
use App\Http\Resources\CommunityResource;
use App\Http\Resources\ProposalResource;
use App\Models\Community;
use App\Repositories\CommunityRepository;
use Illuminate\Http\Response;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * @group Community
 *
 * APIs for retrieving community and organization data from the Catalyst ecosystem.
 */
class CommunityController extends Controller
{
    public function show($communityId): CommunityResource|Response
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

    /**
     * List communities
     *
     * Retrieve a paginated list of communities and organizations in the Catalyst ecosystem with search and filtering capabilities.
     *
     * @queryParam search string Search communities by name or description. Example: DeFi
     * @queryParam page integer The page number for pagination. Example: 1
     * @queryParam per_page integer Number of communities per page (max 60). Example: 24
     * @queryParam ids integer[] Filter by specific community IDs. Example: 123,456
     * @queryParam hashes string[] Filter by community hashes. Example: abc123,def456
     *
     * @response 200 {
     *   "data": [
     *     {
     *       "id": 123,
     *       "name": "Cardano DeFi Alliance",
     *       "description": "A community focused on DeFi development",
     *       "hash": "abc123def456",
     *       "website": "https://example.com",
     *       "members_count": 1250
     *     }
     *   ],
     *   "current_page": 1,
     *   "per_page": 24,
     *   "total": 156
     * }
     * @response 422 {
     *   "status_code": 60,
     *   "message": "query parameter 'per_page' should not exceed 60"
     * }
     *
     * @unauthenticated
     */
    public function index(): array|Response
    {
        $per_page = request('per_page', 24);

        // per_page query doesn't exceed 60
        if ($per_page > 60) {
            return response([
                'status_code' => 60,
                'message' => 'query parameter \'per_page\' should not exceed 60',
            ], 60);
        }

        $requestValues = request(['ids', 'hashes']);

        $ids = null;
        $hashes = null;

        if (! empty($requestValues['hashes'])) {
            $hashes = implode(',', $requestValues['hashes'] ?? []);
            $args['filter'] = "hash IN [{$hashes}]";
        }

        if (! empty($requestValues['ids'])) {
            $ids = implode(',', $requestValues['ids'] ?? []);
            $args['filter'] = "id IN [{$ids}]";
        }

        $page = request('page') ?? 1;
        $args['offset'] = ($page - 1) * $per_page;
        $args['limit'] = $per_page;

        $communities = app(CommunityRepository::class);

        $builder = $communities->search(
            request('search') ?? '',
            $args
        );

        $response = new Fluent($builder->raw());

        $pagination = new LengthAwarePaginator(
            CommunityData::collect($response->hits),
            $response->estimatedTotalHits,
            $per_page,
            $page,
            [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }

    /**
     * List community proposals
     *
     * Retrieve a paginated list of proposals associated with a specific community with filtering and sorting capabilities.
     *
     * @urlParam community required The ID or hash of the community. Example: cardano-foundation-catalyst-participation
     *
     * @queryParam filter[status] string Filter proposals by status (e.g., funded, completed, in_progress). Example: funded
     * @queryParam filter[funding_status] string Filter by funding status. Example: funded
     * @queryParam filter[search] string Search proposals by title or description. Example: DeFi
     * @queryParam sort string Sort proposals by field. Prefix with '-' for descending order. Example: -created_at
     * @queryParam include string Include related data (e.g., campaign, fund, users). Example: campaign,fund
     * @queryParam page integer The page number for pagination. Example: 1
     * @queryParam per_page integer Number of proposals per page (max 60). Example: 24
     *
     * @response 200 {
     *   "data": [
     *     {
     *       "id": 123,
     *       "title": "DeFi Protocol Development",
     *       "status": "completed",
     *       "funding_status": "funded",
     *       "amount_requested": 50000,
     *       "currency": "USD",
     *       "campaign": {
     *         "id": 456,
     *         "title": "Fund 10"
     *       }
     *     }
     *   ],
     *   "links": {
     *     "first": "https://catalystexplorer.local/api/v1/communities/123/proposals?page=1",
     *     "last": "https://catalystexplorer.local/api/v1/communities/123/proposals?page=5",
     *     "prev": null,
     *     "next": "https://catalystexplorer.local/api/v1/communities/123/proposals?page=2"
     *   },
     *   "meta": {
     *     "current_page": 1,
     *     "per_page": 24,
     *     "total": 120
     *   }
     * }
     * @response 404 {
     *   "message": "Community not found"
     * }
     *
     * @unauthenticated
     */
    public function proposals(Community $community)
    {
        $proposals = QueryBuilder::for($community->proposals())
            ->allowedFilters([
                'title',
                'status',
                'funding_status',
                AllowedFilter::scope('search'),
                AllowedFilter::exact('type'),
                AllowedFilter::exact('fund_id'),
            ])
            ->allowedIncludes([
                'campaign',
                'fund',
                'users',
                'tags',
                'links',
                'media',
            ])
            ->allowedSorts([
                'title',
                'status',
                'funding_status',
                'amount_requested',
                'created_at',
                'updated_at',
                'funded_at',
            ])
            ->defaultSort('-created_at')
            ->paginate(
                perPage: min((int) request('per_page', 24), 60)
            )
            ->appends(request()->query());

        return ProposalResource::collection($proposals);
    }
}
