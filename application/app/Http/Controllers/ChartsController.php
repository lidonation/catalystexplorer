<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\CampaignData;
use App\DataTransferObjects\FundData;
use App\Enums\ProposalSearchParams;
use App\Http\Controllers\Concerns\InteractsWithFunds;
use App\Models\Fund;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ChartsController extends Controller
{
    use InteractsWithFunds;

    /**
     * Display the user's profile form.
     */
    public function index(Request $request): Response
    {
        $this->getProps($request);

        [$selectedFund, $allFunds] = $this->resolveSelectedFund($request);

        $selectedFund->append(['banner_img_url']);

        $page = (int) ($request->get(ProposalSearchParams::PAGE()->value) ?? 1);
        $perPage = (int) ($request->get(ProposalSearchParams::PER_PAGE()->value) ?? 24);

        $routeName = $request->route()?->getName();
        $normalizedRouteName = $routeName && str_contains($routeName, 'charts.')
            ? 'charts.'.Str::after($routeName, 'charts.')
            : $routeName;

        $baseProps = [
            'fund' => FundData::from($selectedFund),
            'funds' => $allFunds,
            'filters' => $this->queryParams,
            'activeTabRoute' => $normalizedRouteName,
        ];

        return match ($normalizedRouteName) {
            'charts.registrations' => Inertia::render('Charts/AllCharts/Registrations/index', $baseProps),
            'charts.confirmedVoters' => Inertia::render('Charts/AllCharts/ConfirmedVoters/index', $baseProps),
            'charts.leaderboards' => Inertia::render('Charts/AllCharts/Leaderboards/index', $baseProps),
            'charts.liveTally' => $this->renderLiveTally($baseProps, $selectedFund, $perPage, $page),
            default => $this->renderLiveTally([
                ...$baseProps,
                'activeTabRoute' => 'charts.liveTally',
            ], $selectedFund, $perPage, $page),
        };
    }

    private function renderLiveTally(array $baseProps, Fund $selectedFund, int $perPage, int $page): Response
    {
        return Inertia::render('Charts/AllCharts/LiveTally/index', [
            ...$baseProps,
            'campaigns' => Inertia::optional(function () use ($selectedFund) {
                $campaigns = $this->getCampaigns($selectedFund);
                $campaigns->each->append([
                    'total_requested',
                    'total_awarded',
                    'total_distributed',
                ]);

                return CampaignData::collect($campaigns);
            }),
            'tallies' => Inertia::optional(fn () => $this->getTallies($selectedFund, $perPage, $page)),
        ]);
    }
}
