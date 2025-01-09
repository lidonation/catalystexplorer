<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Fund;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FundsController extends Controller
{
    public function index(Request $request): Response
    {
        $funds = Fund::with('proposals')->get()->map(function ($fund) {
            $totalAllocated = (float) $fund->proposals->sum('amount_received');
            $totalBudget = (float) $fund->proposals->sum('amount_requested');
            $fundedProjects = $fund->proposals->where('funding_status', 'funded')->count();
            $totalProjects = $fund->proposals->count();

            $previousFund = Fund::where('launched_at', '<', $fund->launched_at)
                ->orderBy('launched_at', 'desc')
                ->first();

            $previousProposals = $previousFund ? $previousFund->proposals : collect();

            $previousTotalAllocated = $previousProposals->where('funding_status', 'funded')->sum('amount_received');
            $previousFundedProjects = $previousProposals->where('funding_status', 'funded')->count();

            $percentageChange = $previousTotalAllocated > 0
                ? round((($totalAllocated - $previousTotalAllocated) / $previousTotalAllocated) * 100, 2)
                : 0;

            $projectPercentageChange = $previousFundedProjects > 0
                ? round((($fundedProjects - $previousFundedProjects) / $previousFundedProjects) * 100, 2)
                : 0;

            return [
                'id' => $fund->id,
                'title' => $fund->title,
                'fund' => $fund->title,
                'hero_img_url' => $fund->hero_img_url,
                'Total Proposals' => $totalProjects,
                'Funded Proposals' => $fundedProjects,
                'fundedProjects' => $fundedProjects,
                'totalProjects' => $totalProjects,
                'Completed Proposals' => $fund->proposals->where('status', 'complete')->count(),
                'totalAllocated' => $totalAllocated,
                'totalBudget' => $totalBudget,
                'percentageChange' => $percentageChange.'%',
                'projectPercentageChange' => $projectPercentageChange,
            ];
        });

        $fundRounds = $funds->count();
        $totalProposals = $funds->sum('Total Proposals');
        $fundedProposals = $funds->sum('Funded Proposals');
        $totalFundsRequested = $funds->sum('totalBudget');
        $totalFundsAllocated = $funds->sum('totalAllocated');

        return Inertia::render('Funds/Index', [
            'funds' => $funds,
            'chartSummary' => [
                'fundRounds' => $fundRounds,
                'totalProposals' => $totalProposals,
                'fundedProposals' => $fundedProposals,
                'totalFundsRequested' => number_format($totalFundsRequested, 2).' $',
                'totalFundsAllocated' => number_format($totalFundsAllocated, 2).' $',
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
