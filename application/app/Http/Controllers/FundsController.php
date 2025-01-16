<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\FundData;
use App\DataTransferObjects\MetricData;
use App\Enums\CatalystCurrencies;
use App\Models\Fund;
use App\Repositories\FundRepository;
use App\Repositories\MetricRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FundsController extends Controller
{
    public function index(Request $request, FundRepository $fundRepository): Response
    {
        $funds = FundData::collect($fundRepository->getQuery()->get());
        $totalProposals = $funds->sum('proposals_count');
        $fundedProposals = $funds->sum('funded_proposals_count');
        $totalFundsAwardedADA = $funds->where('currency', CatalystCurrencies::ADA()->value)->sum('amount_awarded');
        $totalFundsAwardedUSD = $funds->where('currency', CatalystCurrencies::USD()->value)->sum('amount_awarded');

        return Inertia::render('Funds/Index', [
            'funds' => $funds,
            'chartSummary' => [
                'totalProposals' => $totalProposals,
                'fundedProposals' => $fundedProposals,
                'totalFundsAwardedAda' => $totalFundsAwardedADA,
                'totalFundsAwardedUsd' => $totalFundsAwardedUSD,
            ],
        ]);
    }

    public function fund(Request $request, Fund $fund, MetricRepository $metrics): Response
    {
        return Inertia::render('Funds/Fund', [
            'fund' => $fund,
            'metrics' => MetricData::collect($metrics->limit(6)->getQuery()->where('context', 'fund')
                ->orderByDesc('order')->get()),
            'campaigns' => $fund->campaigns()->orderByDesc('amount')->get(),
        ]);
    }
}
