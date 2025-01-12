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
        $funds = Fund::withCount('proposals')->get()->map(function ($fund) {
            $totalAllocated = 452032;
            $fundedProjects = 185;
            $previousTotalAllocated = 46.8;
            $previousFundedProjects = 322;

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
                'Total Proposals' => $fund->proposals_count,
                'Funded Proposals' => $fundedProjects,
                'fundedProjects' => $fundedProjects,
                'totalProjects' => 1202,
                'Completed Proposals' => 101, // $fund->proposals->where('status', 'complete')->count(),
                'totalAllocated' => $totalAllocated,
                'totalBudget' => 1732844,
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
