<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\DataTransferObjects\CardanoBudgetProposalData;
use App\DataTransferObjects\ProposalData;
use App\Enums\ProposalSearchParams;
use App\Models\CardanoBudgetProposal;
use App\Models\IdeascaleProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CardanoBudgetProposalController extends Controller
{
    public function index(Request $request)
    {
        $params = $request->query();
        $query = CardanoBudgetProposal::query();

        $query->when(
            isset($params['s']) && is_string($params['s']),
            fn ($q) => $q->where(function ($q2) use ($params) {
                $q2->where('proposal_name', 'ILIKE', '%'.$params['s'].'%')
                    ->orWhere('govtool_username', 'ILIKE', '%'.$params['s'].'%')
                    ->orWhere('country', 'ILIKE', '%'.$params['s'].'%');
            })
        );

        $query->when(
            isset($params['sortBy']),
            fn ($q) => ($q->orderBy($this->getDbColumnName($params['sortBy']), $params['sortOrder'] ?? 'DESC'))
        )->when(
            isset($params['category']) && is_string($params['category']),
            fn ($q) => $q->where('budget_cat', $params['category'])
        )->when(
            isset($params['category']) && is_array($params['category']),
            fn ($q) => $q->whereIn('budget_cat', $params['category'])
        )->when(
            isset($params['committee']) && is_string($params['committee']),
            fn ($q) => $q->where('committee_name', $params['committee'])
        )->when(
            isset($params['committee']) && is_array($params['committee']),
            fn ($q) => $q->whereIn('committee_name', $params['committee'])
        );

        return CardanoBudgetProposalData::collect($query->paginate($params['limit'] ?? 12));
    }

    public function loadProposalsInExplorer(Request $request, string $username)
    {
        $catalystUser = IdeascaleProfile::whereHas(
            'metas',
            fn ($q) => $q->where([
                'key' => 'govtools_username',
                'content' => $username,
            ])
        )->firstOrFail();

        return to_route(
            'proposals.index',
            [
                ProposalSearchParams::IDEASCALE_PROFILES()->value => [
                    $catalystUser->hash,
                ],
            ]
        );

        // ip[0]=w7dbrtpqfg
    }

    public function relatedCatalystProposalsCount(Request $request, string $username)
    {
        $catalystUser = IdeascaleProfile::withCount([
            'proposals',
            'own_proposals',
            'funded_proposals',
            'unfunded_proposals',
            'completed_proposals',
            'in_progress_proposals',
            'outstanding_proposals',
            'collaborating_proposals',
        ])
            ->whereHas(
                'metas',
                fn ($q) => $q->where('key', 'govtools_username')
                    ->where('content', $username)
            )->firstOrFail();

        return [
            'proposals' => $catalystUser->proposals_count,
            'own_proposals' => $catalystUser->own_proposals_count,
            'funded_proposals' => $catalystUser->funded_proposals_count,
            'unfunded_proposals' => $catalystUser->unfunded_proposals_count,
            'completed_proposals' => $catalystUser->completed_proposals_count,
            'in_progress_proposals' => $catalystUser->in_progress_proposals_count,
            'outstanding_proposals' => $catalystUser->outstanding_proposals_count,
            'collaborating_proposals' => $catalystUser->collaborating_proposals_count,
        ];
    }

    public function relatedCatalystProposals(Request $request, string $username)
    {
        $perPage = $request->get('perPage', 24);
        $page = $request->get('page', 1);

        $catalystUser = IdeascaleProfile::whereHas(
            'metas',
            fn ($q) => $q->where([
                'key' => 'govtools_username',
                'content' => $username,
            ])
        )->firstOrFail();

        return ProposalData::collect(
            $catalystUser->proposals()
                ->paginate($perPage, ['*'], 'page', $page)
        );
    }

    public function categories()
    {
        return CardanoBudgetProposal::select('budget_cat')
            ->distinct()
            ->orderBy('budget_cat')
            ->pluck('budget_cat');
    }

    public function metrics(Request $request)
    {
        $whereQueries = CardanoBudgetProposal::query()
            ->when(
                $request->has('s'),
                fn ($q) => $q->where('proposal_name', 'iLIKE', '%'.$request->input('s').'%')
                    ->orWhere('govtool_username', 'iLIKE', '%'.$request->input('s').'%')
                    ->orWhere('country', 'iLIKE', '%'.$request->input('s').'%')
            )
            ->when(
                $request->filled('category'),
                fn ($q) => $q->where('budget_cat', $request->input('category'))
            )
            ->when( 
                $request->filled('committee'),
                fn ($q) => $q->where('committee_name', $request->input('committee'))
            );

        $whereClaus = Str::of($whereQueries->toRawSql())->after('where')->value();
        if (str_contains($whereClaus, 'select')) {
            $whereClaus = '';
        }

        $mmmWhere = 'WHERE cardano_budget_proposals.usd_to_ada_conversion_rate BETWEEN 0.01 AND 5.0';

        if (! empty($whereClaus)) {
            $mmmWhere = "{$mmmWhere} AND ({$whereClaus})";
        }

        $query = CardanoBudgetProposal::selectRaw('COUNT(id) as total_proposals')
            ->addSelect(DB::raw('SUM(ada_amount) as total_ada'))
            ->addSelect(DB::raw('(SELECT COUNT(intersect_named_administrator) FROM cardano_budget_proposals '.$mmmWhere.' AND intersect_named_administrator=TRUE) as intersect_named_administrator'))
            ->addSelect(DB::raw('(SELECT AVG(usd_to_ada_conversion_rate) FROM cardano_budget_proposals '.$mmmWhere.') as mean_usd_to_ada_conversion_rate'))
            ->addSelect(DB::raw('(SELECT percentile_cont(0.5) WITHIN GROUP(ORDER BY usd_to_ada_conversion_rate) FROM cardano_budget_proposals '.$mmmWhere.') as median_usd_to_ada_conversion_rate'))
            ->addSelect(DB::raw('(SELECT mode() WITHIN GROUP(ORDER BY usd_to_ada_conversion_rate) FROM cardano_budget_proposals '.$mmmWhere.') as mode_usd_to_ada_conversion_rate'));

        if (! empty($whereClaus)) {
            $query->whereRaw($whereClaus);
        }

        return collect($query->first())
            ?->mapWithKeys(
                fn ($value, $key) => (
                    [Str::of($key)->camel()->value() => match ($key) {
                        'mean_usd_to_ada_conversion_rate',
                        'median_usd_to_ada_conversion_rate',
                        'mode_usd_to_ada_conversion_rate' => floatval($value),
                        default => intval($value),
                    }]
                )
            );
    }

    protected function getDbColumnName($column)
    {
        return match ($column) {
            'commentsCount' => 'prop_comments_number',
            default => Str::of($column)->snake()->value()
        };
    }
}
