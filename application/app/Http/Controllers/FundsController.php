<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\FundData;
use App\DataTransferObjects\MetricData;
use App\DataTransferObjects\CampaignData;
use App\Enums\CatalystCurrencies;
use App\Enums\CampaignsSortBy;
use App\Models\Fund;
use App\Repositories\FundRepository;
use App\Repositories\MetricRepository;
use App\Enums\ProposalSearchParams;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use function Amp\Dns\query;

class FundsController extends Controller
{
    protected array $queryParams = [];
    public $fund;


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

        $this->fund = $fund;

        $campaigns = $this->getCampaigns();

        return Inertia::render('Funds/Fund', [
            'fund' => $fund,
            'filters' => $this->queryParams,
            'metrics' => MetricData::collect($metrics
                ->limit(6)
                ->getQuery()
                ->where('context', 'fund')
                ->orderByDesc('order')
                ->get()),
            'campaigns' => $campaigns,
        ]);
    }

    protected function getProps(Request $request): void
    {
        $this->queryParams = $request->validate([
            ProposalSearchParams::SORTS()->value => 'nullable'
        ]);
    }

    public function getCampaigns()
    {
        $sortParam = $this->queryParams[ProposalSearchParams::SORTS()->value] ?? null;
        $sortField = null;
        $sortDirection = null;

        if ($sortParam) {
            list($sortField, $sortDirection) = explode(':', $sortParam);
        }

        $query = $this->fund->campaigns();

        if ($sortField && $sortDirection && in_array($sortDirection, ['asc', 'desc'])) {
            if ($sortField === CampaignsSortBy::AMOUNT()->value) {
                $query->orderBy(CampaignsSortBy::AMOUNT()->value, $sortDirection);
            } elseif ($sortField === CampaignsSortBy::PROPOSALSCOUNT()->value) {
                $query->orderBy(CampaignsSortBy::PROPOSALSCOUNT()->value, $sortDirection);
            }
        }

        return $query->get();
    }
}
