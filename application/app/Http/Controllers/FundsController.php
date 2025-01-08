<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Fund;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use App\Repositories\FundRepository;
class FundsController extends Controller
{

    public function index(Request $request): Response
    {
        $funds = Fund::with('proposals')->get()->map(function ($fund) {
            $totalAllocated = $fund->proposals->sum('amount_received');
            $totalBudget = $fund->proposals->sum('amount_requested');
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
                'hero_img_url' => $fund->hero_img_url,
                'totalAllocated' => $totalAllocated,
                'totalBudget' => $totalBudget,
                'fundedProjects' => $fundedProjects,
                'totalProjects' => $totalProjects,
                'percentageChange' => $percentageChange . '%',
                'projectPercentageChange' => $projectPercentageChange,
            ];
        });
        return Inertia::render('Funds/Index', ['funds' => $funds]);
    }
}
