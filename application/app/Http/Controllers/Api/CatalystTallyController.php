<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CatalystTallyCollection;
use App\Http\Resources\CatalystTallyResource;
use App\Models\CatalystTally;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class CatalystTallyController extends Controller
{
    /**
     * Display a listing of catalyst tallies with filters.
     */
    public function index(Request $request)
    {
        $perPage = min($request->get('per_page', 20), 100);
        $sortBy = $request->get('sort_by', 'tally');
        $sortDirection = $request->get('sort_direction', 'desc');

        $with = [];

        if ($request->get('fund') || $request->get('include_fund')) {
            $with[] = 'fund';
        }

        if ($request->get('search') || $request->get('proposal_profiles') || $request->get('include_proposal')) {
            $with[] = 'proposal.proposal_profiles.model';
        }

        $query = CatalystTally::with($with);

        if ($fund = $request->get('fund')) {
            $query->whereHas('fund', function (Builder $q) use ($fund) {
                $q->where('id', $fund);
            });
        }

        if ($search = $request->get('search')) {
            $query->whereHas('proposal', function (Builder $q) use ($search) {
                $q->where('title', 'ILIKE', '%'.$search.'%')
                    ->orWhere('problem', 'ILIKE', '%'.$search.'%')
                    ->orWhere('solution', 'ILIKE', '%'.$search.'%');
            })->orWhereHas('fund', function (Builder $q) use ($search) {
                $q->where('title', 'ILIKE', '%'.$search.'%');
            });
        }

        if ($profiles = $request->get('proposal_profiles')) {
            $profileIds = is_array($profiles) ? $profiles : explode(',', $profiles);
            $query->whereHas('proposal.proposal_profiles', function (Builder $q) use ($profileIds) {
                $q->whereIn('model_id', $profileIds);
            });
        }

        $validSortFields = ['tally', 'fund_rank', 'category_rank', 'overall_rank', 'chance_approval', 'chance_funding'];
        if (in_array($sortBy, $validSortFields)) {
            if (in_array($sortDirection, ['asc', 'desc'])) {
                $query->orderBy($sortBy, $sortDirection);
            }
        }

        $tallies = $query->paginate($perPage);

        return new CatalystTallyCollection($tallies);
    }

    /**
     * Display the specified catalyst tally.
     */
    public function show(CatalystTally $catalystTally): CatalystTallyResource
    {
        $catalystTally->load([
            'fund',
            'proposal.proposal_profiles.model',
        ]);

        return new CatalystTallyResource($catalystTally);
    }

    /**
     * Get available funds for filtering.
     */
    public function funds(): \Illuminate\Http\JsonResponse
    {
        // Get funds that have catalyst tallies
        $funds = \App\Models\Fund::whereHas('catalyst_tallies')
            ->select(['id', 'title', 'slug'])
            ->orderBy('title')
            ->get();

        return response()->json([
            'data' => $funds,
        ]);
    }

    /**
     * Get statistics about catalyst tallies.
     */
    public function stats(): \Illuminate\Http\JsonResponse
    {
        $stats = [
            'total_tallies' => CatalystTally::count(),
            'total_proposals' => CatalystTally::distinct('model_id')->count(),
            'total_funds' => CatalystTally::distinct('context_id')->count(),
            'avg_tally' => CatalystTally::avg('tally'),
            'max_tally' => CatalystTally::max('tally'),
            'min_tally' => CatalystTally::min('tally'),
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }
}
