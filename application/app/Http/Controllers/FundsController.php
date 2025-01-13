<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Fund;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Repositories\FundRepository;
use App\DataTransferObjects\FundData;

class FundsController extends Controller
{

    public function index(Request $request, FundRepository $fundRepository): Response
    {
        $funds = FundData::collect($fundRepository->getQuery()->get());
        $totalProposals = $funds->sum('proposals_count');
        $fundedProposals = $funds->sum('funded_proposals_count');
        $totalFundsRequested = $funds->sum('amount_requested');
        $totalFundsAllocated = $funds->sum('amount_received');

        return Inertia::render('Funds/Index', [
            'funds' => $funds,
            'chartSummary' => [
                'totalProposals' => $totalProposals,
                'fundedProposals' => $fundedProposals,
                'totalFundsRequested' => $totalFundsRequested,
                'totalFundsAllocated' => $totalFundsAllocated,
            ],
        ]);
    }

    public function fund(Request $request, Fund $fund): Response
    {
        return Inertia::render('Funds/Fund', [
            'fund' => $fund,
        ]);
    }


}
