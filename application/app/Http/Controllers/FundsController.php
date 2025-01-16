<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\FundData;
use App\DataTransferObjects\MetricData;
use App\Enums\CatalystCurrencies;
use App\Enums\CampaignsSortBy;
use App\Models\Fund;
use App\Repositories\FundRepository;
use App\Repositories\MetricRepository;
use App\Enums\ProposalSearchParams;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FundsController extends Controller
{
    protected array $queryParams = [];


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
    $this->getProps($request);

    $sortParam = $this->queryParams[ProposalSearchParams::SORTS()->value] ?? null;
    $sortField = '';
    $sortDirection = ''; 

    if ($sortParam) {
        list($sortField, $sortDirection) = explode(':', $sortParam);
    }

    $query = $fund->campaigns();

    if ($sortField === CampaignsSortBy::AMOUNT()->value) {
        $query->orderBy(CampaignsSortBy::AMOUNT()->value, $sortDirection);
    } elseif ($sortField === CampaignsSortBy::PROPOSALSCOUNT()->value) {
        $query->orderBy(CampaignsSortBy::PROPOSALSCOUNT()->value, $sortDirection);
    }

    return Inertia::render('Funds/Fund', [
        'fund' => $fund,
        'metrics' => MetricData::collect($metrics->limit(6)->getQuery()->where('context', 'fund')
            ->orderByDesc('order')->get()),
        'campaigns' => $query->get(),
        'filters' => $this->queryParams
    ]);
}



    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            ProposalSearchParams::SORTS()->value => 'nullable'
        ]);
    }

    public function sortCampaigns(){

    }
}
