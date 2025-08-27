<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FundResource;
use App\Models\Fund;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedInclude;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\QueryBuilder;
use App\QueryBuilders\Sorts\ProjectLengthSort;

class FundController extends Controller
{
    /**
     * Display a listing of funds with filtering, sorting, and includes.
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
                AllowedSort::custom('project_length', new ProjectLengthSort()),
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
