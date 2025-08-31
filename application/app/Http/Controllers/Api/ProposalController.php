<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\ProposalData;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProposalResource;
use App\Models\Proposal;
use App\QueryBuilders\Sorts\ProjectLengthSort;
use App\Repositories\ProposalRepository;
use Illuminate\Foundation\Application;
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

        $proposals = QueryBuilder::for(Proposal::class)
            ->allowedFilters([
                AllowedFilter::exact('id'),
                AllowedFilter::partial('title'),
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
            ->defaultSort('-created_at')
            ->paginate($per_page);

        return ProposalResource::collection($proposals);
    }

    /**
     * Display the specified proposal with optional includes.
     */
    public function show(Request $request, string $id): ProposalResource
    {
        $proposal = QueryBuilder::for(Proposal::class)
            ->allowedIncludes([
                AllowedInclude::relationship('campaign'),
                AllowedInclude::relationship('user'),
                AllowedInclude::relationship('fund'),
                AllowedInclude::relationship('team'),
                AllowedInclude::relationship('schedule'),
                AllowedInclude::relationship('schedule.milestones'),
            ])
            ->findOrFail($id);

        return new ProposalResource($proposal);
    }

    /**
     * Legacy endpoint for backwards compatibility
     */
    public function proposals(): array
    {
        $per_page = request('per_page', 24);

        $requestValues = request(['ids']);

        $ids = null;

        if (! empty($requestValues['ids'])) {
            $ids = implode(',', $requestValues['ids'] ?? []);
            $args['filter'] = "id IN [{$ids}]";
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
