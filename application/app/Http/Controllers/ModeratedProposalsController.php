<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\ProposalData;
use App\Models\Fund;
use App\Models\Proposal;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ModeratedProposalsController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = (int) $request->input('l', 30);
        $currentPage = (int) $request->input('p', 1);
        $search = $request->input('q', null);
        $fundId = $request->input('fund_id', null);

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

        if ($search) {
            $query->where('proposals.title', 'ILIKE', '%'.$search.'%');
        }

        if ($fundId) {
            $query->where('proposals.fund_id', $fundId);
        }

        $query->orderBy('proposals.deleted_at', 'desc');

        $proposals = $query->paginate($perPage, ['*'], 'page', $currentPage);

        $funds = Cache::remember(
            'moderated_proposals:funds_list',
            now()->addDay(),
            fn () => Fund::select('id', 'title', 'label')
                ->orderBy('launched_at', 'desc')
                ->get()
                ->map(function ($fund) {
                    return [
                        'id' => $fund->id,
                        'label' => $fund->label,
                        'title' => $fund->title,
                    ];
                })
        );

        $fundsCount = Cache::remember(
            'moderated_proposals:funds_count',
            now()->addMinutes(10),
            fn () => Proposal::onlyTrashed()
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
                ->toArray()
        );

        $proposalsData = ProposalData::collect($proposals->items());

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
