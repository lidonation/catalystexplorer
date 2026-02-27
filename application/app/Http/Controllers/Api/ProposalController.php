<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\ProposalData;
use App\Enums\ProposalSearchParams;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProposalResource;
use App\Models\Comment;
use App\Models\Proposal;
use App\QueryBuilders\Includes\IncludedNoop;
use App\QueryBuilders\Sorts\ProjectLengthSort;
use App\Repositories\ProposalRepository;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedInclude;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * @group Proposals
 *
 * APIs for managing and retrieving Project Catalyst proposals. Proposals represent funding requests submitted to the Catalyst ecosystem.
 */
class ProposalController extends Controller
{
    /**
     * List proposals
     *
     * Retrieve a paginated list of Project Catalyst proposals with advanced filtering, sorting, and relationship includes.
     *
     * @queryParam page integer The page number for pagination. Example: 1
     * @queryParam per_page integer Number of proposals per page (max 60). Example: 24
     * @queryParam filter[id] integer Filter by exact proposal ID. Example: 123
     * @queryParam filter[title] string Search proposals by title (case insensitive). Example: DeFi
     * @queryParam filter[status] string Filter by proposal status. Example: funded
     * @queryParam filter[type] string Filter by proposal type. Example: project
     * @queryParam filter[category] string Filter by proposal category. Example: developer-tools
     * @queryParam filter[campaign_id] integer Filter by campaign ID. Example: 456
     * @queryParam filter[fund_id] integer Filter by fund ID. Example: 12
     * @queryParam filter[funded] boolean Filter only funded proposals (any non-empty value). Example: 1
     * @queryParam filter[amount_min] integer Filter by minimum requested amount (in ADA lovelace). Example: 10000000
     * @queryParam filter[amount_max] integer Filter by maximum requested amount (in ADA lovelace). Example: 100000000
     * @queryParam include string Comma-separated list of relationships to include (campaign,user,fund,team,schedule,schedule.milestones,links,meta_data,reviews,ai_summary). Use ai_summary to include AI-generated summaries (generated on demand for the show endpoint if not yet available). Example: campaign,fund,ai_summary
     * @queryParam sort string Comma-separated list of fields to sort by. Prefix with - for descending order. Available: title,status,amount_requested,amount_received,project_length,yes_votes_count,no_votes_count,funded_at,created_at,updated_at. Example: -created_at,title
     *
     * @response 200 {
     *   "data": [
     *     {
     *       "id": 123,
     *       "title": {
     *         "en": "DeFi Protocol Development"
     *       },
     *       "status": "funded",
     *       "amount_requested": 50000000,
     *       "amount_received": 45000000,
     *       "funded_at": "2024-01-15T10:30:00Z",
     *       "yes_votes_count": 250,
     *       "no_votes_count": 15
     *     }
     *   ],
     *   "links": {
     *     "first": "https://api.catalystexplorer.com/api/v1/proposals?page=1",
     *     "last": "https://api.catalystexplorer.com/api/v1/proposals?page=10",
     *     "prev": null,
     *     "next": "https://api.catalystexplorer.com/api/v1/proposals?page=2"
     *   },
     *   "meta": {
     *     "current_page": 1,
     *     "per_page": 24,
     *     "total": 240
     *   }
     * }
     *
     * @unauthenticated
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $per_page = $request->get('per_page', 24);

        if ($per_page > 60) {
            $per_page = 60;
        }

        $queryBuilder = QueryBuilder::for(Proposal::class)
            ->select('proposals.*')
            ->allowedFilters([
                AllowedFilter::exact('id'),
                AllowedFilter::callback('title', function ($query, $value) {
                    // Handle JSON title column - search in the 'en' field
                    $query->whereRaw("title->>'en' ILIKE ?", ["%{$value}%"]);
                }),
                AllowedFilter::exact('status'),
                AllowedFilter::exact('type'),
                AllowedFilter::exact('category'),
                AllowedFilter::exact('campaign_id'),
                AllowedFilter::exact('fund_id'),
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
                AllowedInclude::relationship('user'),
                AllowedInclude::relationship('fund'),
                AllowedInclude::relationship('team'),
                AllowedInclude::relationship('schedule'),
                AllowedInclude::relationship('schedule.milestones'),
                AllowedInclude::relationship('links'),
                AllowedInclude::relationship('meta_data'),
                AllowedInclude::relationship('reviews'),
                // ai_summary is not a relationship — it's handled in ProposalResource.
                // Registered here so Spatie QueryBuilder doesn't reject it.
                AllowedInclude::custom('ai_summary', new IncludedNoop),
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
                AllowedSort::field('updated_at'),
            ])
            ->defaultSort(['-created_at', '-id']);

        $includedRelations = collect(explode(',', $request->get('include', '')))
            ->filter()
            ->map(fn ($relation) => trim($relation))
            ->reject(fn ($r) => $r === 'ai_summary') // not a relationship
            ->toArray();

        if (! empty($includedRelations)) {
            $queryBuilder->with($includedRelations);
        }

        $proposals = $queryBuilder->paginate($per_page);

        // Remove currency from appends to prevent automatic relationship loading
        $proposals->getCollection()->each(function ($proposal) {
            $proposal->makeHidden(['currency']);
        });

        return ProposalResource::collection($proposals);
    }

    /**
     * Get proposal details
     *
     * Retrieve detailed information about a specific proposal including optional related data.
     *
     * @urlParam id integer required The proposal ID. Example: 123
     *
     * @queryParam include string Comma-separated list of relationships to include (campaign,user,fund,team,schedule,schedule.milestones,links,meta_data,reviews). Example: campaign,fund,team
     *
     * @response 200 {
     *   "data": {
     *     "id": 123,
     *     "title": {
     *       "en": "DeFi Protocol Development"
     *     },
     *     "status": "funded",
     *     "type": "project",
     *     "category": "developer-tools",
     *     "amount_requested": 50000000,
     *     "amount_received": 45000000,
     *     "funded_at": "2024-01-15T10:30:00Z",
     *     "yes_votes_count": 250,
     *     "no_votes_count": 15,
     *     "reviews_count": 12,
     *     "created_at": "2023-12-01T09:00:00Z",
     *     "updated_at": "2024-01-15T10:30:00Z",
     *     "campaign": {
     *       "id": 456,
     *       "title": "Fund 12 - Developer Tools"
     *     }
     *   }
     * }
     * @response 404 {
     *   "message": "No query results for model [App\\Models\\Proposal] 999"
     * }
     *
     * @unauthenticated
     */
    public function show(Request $request, string $id): ProposalResource
    {
        $queryBuilder = QueryBuilder::for(Proposal::class)
            ->allowedIncludes([
                AllowedInclude::relationship('campaign'),
                AllowedInclude::relationship('user'),
                AllowedInclude::relationship('fund'),
                AllowedInclude::relationship('team'),
                AllowedInclude::relationship('schedule'),
                AllowedInclude::relationship('schedule.milestones'),
                AllowedInclude::relationship('links'),
                AllowedInclude::relationship('meta_data'),
                AllowedInclude::relationship('reviews'),
                AllowedInclude::custom('ai_summary', new IncludedNoop),
            ]);

        // Check if any relations are being included and ensure they're loaded
        $includedRelations = collect(explode(',', $request->get('include', '')))
            ->filter()
            ->map(fn ($relation) => trim($relation))
            ->reject(fn ($r) => $r === 'ai_summary')
            ->toArray();

        if (! empty($includedRelations)) {
            $queryBuilder->with($includedRelations);
        }

        $proposal = $queryBuilder->findOrFail($id);

        // Load metas and reviews
        $proposal->load('metas', 'reviews');
        $proposal->loadCount('reviews');

        // Remove currency from appends to prevent automatic relationship loading
        $proposal->makeHidden(['currency']);

        return new ProposalResource($proposal);
    }

    /**
     * Store a rationale for a proposal
     */
    public function storeRationale(Request $request, string $id): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'rationale' => 'required|string|max:5000',
        ]);

        $proposal = Proposal::findOrFail($id);
        $user = $request->user();

        if (! $user) {
            return back()->withErrors(['error' => 'Authentication required']);
        }

        Comment::create([
            'commentable_type' => Proposal::class,
            'commentable_id' => $proposal->id,
            'text' => $request->rationale,
            'original_text' => $request->rationale,
            'commentator_id' => $user->id,
            'extra' => ['type' => 'rationale'],
        ]);

        return back()->with('success', 'Rationale saved successfully');
    }

    /**
     * Legacy endpoint for backwards compatibility
     */
    public function proposals(): array
    {
        $per_page = request('per_page', 24);

        $requestValues = request(['ids']);
        $fundId = request(ProposalSearchParams::FUNDS()->value);

        $filters = [];

        if (! empty($requestValues['ids'])) {
            $ids = implode(',', $requestValues['ids'] ?? []);
            $filters[] = "id IN [{$ids}]";
        }

        if (! empty($fundId)) {
            $filters[] = "fund.id = {$fundId}";
        }

        $args = [];
        if (! empty($filters)) {
            $args['filter'] = implode(' AND ', $filters);
        }

        $page = request('page') ?? 1;
        $args['offset'] = ($page - 1) * $per_page;
        $args['limit'] = $per_page;

        $proposals = app(ProposalRepository::class);

        $builder = $proposals->search(
            request('search') ?? '',
            $args
        );

        $response = new Fluent($builder->raw());

        $pagination = new LengthAwarePaginator(
            ProposalData::collect($response->hits),
            $response->estimatedTotalHits,
            $per_page,
            $page,
            [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }
}
