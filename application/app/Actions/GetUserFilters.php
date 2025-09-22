<?php

declare(strict_types=1);

namespace App\Actions;

use App\Enums\ProposalSearchParams;
use Illuminate\Http\Request;

class GetUserFilters
{
    public function __invoke(Request $request): array
    {
        $filters = [];

        if ($request->has(ProposalSearchParams::FUNDING_STATUS()->value)) {
            $fundingStatuses = implode(',', (array) $request->input(ProposalSearchParams::FUNDING_STATUS()->value, []));
            $filters[] = "funding_status IN [{$fundingStatuses}]";
        }

        if ($request->has(ProposalSearchParams::PROJECT_STATUS()->value)) {
            $projectStatuses = implode(',', (array) $request->input(ProposalSearchParams::PROJECT_STATUS()->value, []));
            $filters[] = "status IN [{$projectStatuses}]";
        }

        if ($request->has(ProposalSearchParams::OPENSOURCE_PROPOSALS()->value)) {
            $filters[] = 'opensource='.match ($request->input(ProposalSearchParams::OPENSOURCE_PROPOSALS()->value)) {
                '0' => 'false',
                '1' => 'true'
            };
        }

        $filters[] = 'type='.$request->input(ProposalSearchParams::TYPE()->value, 'proposal');

        if ($request->has(ProposalSearchParams::QUICK_PITCHES()->value)) {
            $filters[] = 'quickpitch IS NOT NULL';
        }

        if ($request->filled(ProposalSearchParams::BUDGETS()->value)) {
            $budgetRange = collect((object) (array) $request->input(ProposalSearchParams::BUDGETS()->value, []));
            $filters[] = "(amount_requested  {$budgetRange->first()} TO  {$budgetRange->last()})";
        }

        if ($request->filled(ProposalSearchParams::CAMPAIGNS()->value)) {
            $campaignIds = (array) $request->input(ProposalSearchParams::CAMPAIGNS()->value, []);
            $filters[] = '('.implode(' OR ', array_map(fn ($c) => "campaign.id = {$c}", $campaignIds)).')';
        }

        if ($request->filled(ProposalSearchParams::TAGS()->value)) {
            $tagIds = (array) $request->input(ProposalSearchParams::TAGS()->value, []);
            $filters[] = '('.implode(' OR ', array_map(fn ($c) => "tags.id = {$c}", $tagIds)).')';
        }

        if ($request->filled(ProposalSearchParams::IDEASCALE_PROFILES()->value)) {
            $ideascaleProfileIds = implode(',', (array) $request->input(ProposalSearchParams::IDEASCALE_PROFILES()->value, []));
            $filters[] = "users.id IN [{$ideascaleProfileIds}]";
        }

        if ($request->filled(ProposalSearchParams::CATALYST_PROFILES()->value)) {
            $catalystProfileIds = implode(',', (array) $request->input(ProposalSearchParams::CATALYST_PROFILES()->value, []));
            $filters[] = "claimed_catalyst_profiles.id IN [{$catalystProfileIds}]";
        }

        if ($request->filled(ProposalSearchParams::GROUPS()->value)) {
            $groupIds = implode(',', (array) $request->input(ProposalSearchParams::GROUPS()->value, []));
            $filters[] = "groups.id IN [{$groupIds}]";
        }

        if ($request->filled(ProposalSearchParams::COMMUNITIES()->value)) {
            $communityHashes = implode(',', (array) $request->input(ProposalSearchParams::COMMUNITIES()->value, []));
            $filters[] = "communities.id IN [{$communityHashes}]";
        }

        if ($request->filled(ProposalSearchParams::PROJECT_LENGTH()->value)) {
            $projectLength = collect((object) (array) $request->input(ProposalSearchParams::PROJECT_LENGTH()->value, []));
            $filters[] = "(project_length  {$projectLength->first()} TO  {$projectLength->last()})";
        }

        if ($request->filled(ProposalSearchParams::COHORT()->value)) {
            $cohortFilters = array_map(fn ($cohort) => "{$cohort} = 1", (array) $request->input(ProposalSearchParams::COHORT()->value, []));
            $filters[] = '('.implode(' OR ', $cohortFilters).')';
        }

        if ($request->filled(ProposalSearchParams::FUNDS()->value)) {
            $fundIds = (array) $request->input(ProposalSearchParams::FUNDS()->value, []);
            $funds = implode("','", $fundIds);
            $filters[] = "fund.id IN ['{$funds}']";
        }

        return $filters;
    }
}
