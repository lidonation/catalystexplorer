<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProposalResource;
use App\Models\Proposal;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedInclude;
use Spatie\QueryBuilder\AllowedSort;

class ProposalController extends Controller
{
    /**
     * Display a listing of proposals with filtering, sorting, and includes.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $per_page = $request->get('per_page', 24);

        // per_page query doesn't exceed 60
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
            ])
            ->allowedSorts([
                AllowedSort::field('title'),
                AllowedSort::field('status'),
                AllowedSort::field('amount_requested'),
                AllowedSort::field('amount_received'),
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
            ])
            ->findOrFail($id);

        return new ProposalResource($proposal);
    }

    /**
     * Legacy endpoint for backwards compatibility
     */
    public function proposals(): AnonymousResourceCollection
    {
        return $this->index(request());
    }
}
