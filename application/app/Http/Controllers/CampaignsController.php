<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\ProposalData;
use App\Models\Campaign;
use App\Models\Fund;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CampaignsController extends Controller
{
    protected array $queryParams = [];

    public function show(Request $request, Fund $fund, Campaign $campaign): Response
    {
        $campaign->loadCount([
            'completed_proposals',
            'unfunded_proposals',
            'funded_proposals',
        ])->append([
            'total_requested',
            'total_awarded',
            'total_distributed',
        ]);

        return Inertia::render('Funds/Campaign', [
            'fund' => $fund,
            'campaign' => $campaign,
            'proposals' => Inertia::optional(
                fn () => to_length_aware_paginator(
                    ProposalData::collect(
                        $campaign->proposals()->with(['users', 'fund'])
                            ->paginate(12, ['*'], 'p')
                    ))->onEachSide(0)
            ),
        ]);
    }
}
