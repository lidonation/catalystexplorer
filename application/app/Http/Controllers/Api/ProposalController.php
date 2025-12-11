<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\ProposalData;
use App\Enums\ProposalSearchParams;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProposalResource;
use App\Models\Comment;
use App\Models\Proposal;
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

class ProposalController extends Controller
{
    /**
     * Display a listing of proposals with filtering, sorting, and includes.
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
     * Display the specified proposal with optional includes.
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
            ]);

        // Check if any relations are being included and ensure they're loaded
        $includedRelations = collect(explode(',', $request->get('include', '')))
            ->filter()
            ->map(fn ($relation) => trim($relation))
            ->toArray();

        if (! empty($includedRelations)) {
            $queryBuilder->with($includedRelations);
        }

        $proposal = $queryBuilder->findOrFail($id);

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
