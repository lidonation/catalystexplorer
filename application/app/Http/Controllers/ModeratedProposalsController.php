<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\ProposalData;
use App\Models\Fund;
use App\Models\Proposal;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class ModeratedProposalsController extends Controller
{
    public function index(Request $request): Response
    {
        // Get query parameters
        $perPage = (int) $request->input('l', 60);
        $currentPage = (int) $request->input('p', 1);
        $search = $request->input('q', null);
        $fundId = $request->input('fund_id', null);

        // Base query for soft deleted proposals with moderated_reason meta
        $query = Proposal::onlyTrashed()
            ->select('proposals.*')
            ->join('metas', function ($join) {
                $join->on('metas.model_id', '=', 'proposals.id')
                    ->where('metas.model_type', '=', 'App\\Models\\Proposal')
                    ->where('metas.key', '=', 'moderated_reason');
            })
            ->with(['fund', 'campaign', 'metas' => function ($query) {
                $query->whereIn('key', ['moderated_reason', 'catalyst_app_url', 'catalyst_document_id']);
            }]);

        // Apply search filter
        if ($search) {
            $query->where('proposals.title', 'ILIKE', '%'.$search.'%');
        }

        // Apply fund filter
        if ($fundId) {
            $query->where('proposals.fund_id', $fundId);
        }

        // Order by most recently deleted
        $query->orderBy('proposals.deleted_at', 'desc');

        // Paginate
        $proposals = $query->paginate($perPage, ['*'], 'page', $currentPage);

        // Get all funds for filter
        $funds = Fund::select('id', 'title', 'label')
            ->orderBy('launched_at', 'desc')
            ->get()
            ->map(function ($fund) {
                return [
                    'id' => $fund->id,
                    'label' => $fund->label,
                    'title' => $fund->title,
                ];
            });

        // Get funds count for proposals
        $fundsCount = Proposal::onlyTrashed()
            ->join('metas', function ($join) {
                $join->on('metas.model_id', '=', 'proposals.id')
                    ->where('metas.model_type', '=', 'App\\Models\\Proposal')
                    ->where('metas.key', '=', 'moderated_reason');
            })
            ->join('funds', 'proposals.fund_id', '=', 'funds.id')
            ->selectRaw('funds.id, funds.label, funds.title, count(proposals.id) as count')
            ->groupBy('funds.id', 'funds.label', 'funds.title')
            ->get()
            ->keyBy('id')
            ->map(fn ($fund) => [
                'label' => $fund->label,
                'title' => $fund->title,
                'count' => $fund->count,
            ])
            ->toArray();

        // Transform to DTO
        $proposalsData = ProposalData::collect($proposals->items());

        // Create paginated array
        $paginatedProposals = new LengthAwarePaginator(
            $proposalsData,
            $proposals->total(),
            $proposals->perPage(),
            $proposals->currentPage(),
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );

        return Inertia::render('ModeratedProposals/Index', [
            'proposals' => $paginatedProposals->toArray(),
            'funds' => $funds,
            'fundsCount' => $fundsCount,
            'filters' => [
                'q' => $search,
                'fund_id' => $fundId,
                'p' => $currentPage,
                'l' => $perPage,
            ],
        ]);
    }
}
