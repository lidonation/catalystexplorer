<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\CardanoBudgetProposal;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SyncCardanoBudgetProposals extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cx:sync-cardano-budget-proposals';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync cardano budget proposals.';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $page = 1;
        do {
            $params = [
                'filters' => [
                    '$and' => [['is_active' => 'true']],
                ],
                'populate' => [
                    'bd_costing',
                    'bd_psapb.type_name',
                    'bd_proposal_detail',
                    'creator',
                ],
                'pagination' => [
                    'page' => $page,
                    'pageSize' => 1000,
                ],
                'sort' => [
                    'createdAt' => 'desc',
                ],
            ];

            $authResponse = Http::get(config('services.govtools.budget_proposals').'/bds', $params);

            if ($authResponse->successful()) {
                $data = $authResponse->collect()->get('data');
                collect($data)->each(function ($proposal) {
                    $props = collect([]);
                    $props->put('govtool_proposal_id', $proposal['id']);

                    if (! isset($proposal['attributes'])) {
                        throw new \Exception('Malformed data.');
                    }

                    $attributes = $proposal['attributes'];

                    $props->put('is_active', $attributes['is_active']);
                    $props->put('privacy_policy', $attributes['privacy_policy']);
                    $props->put('intersect_admin_further_text', $attributes['intersect_named_administrator']);
                    $props->put('intersect_named_administrator', $attributes['intersect_named_administrator']);
                    $props->put('prop_comments_number', $attributes['prop_comments_number']);
                    $props->put('created_at', $attributes['createdAt']);
                    $props->put('updated_at', $attributes['updatedAt']);

                    if (! isset($attributes['bd_costing'])) {
                        throw new \Exception('Malformed data.');
                    }

                    $cost = $attributes['bd_costing']['data']['attributes'];
                    $props->put('ada_amount', $cost['ada_amount']);
                    $props->put('amount_in_preferred_currency', $cost['amount_in_preferred_currency']);
                    $sanitizedConversationRate = (float) filter_var(
                        str_replace(' ', '.', str_replace(',', '.', $cost['usd_to_ada_conversion_rate'])),
                        FILTER_SANITIZE_NUMBER_FLOAT,
                        FILTER_FLAG_ALLOW_FRACTION
                    );
                    $props->put('usd_to_ada_conversion_rate', $sanitizedConversationRate);

                    $props->put('cost_breakdown', $cost['cost_breakdown']);

                    if (! isset($attributes['bd_psapb'])) {
                        throw new \Exception('Malformed data.');
                    }

                    $bd_psapb = $attributes['bd_psapb']['data']['attributes'];
                    $props->put('proposal_benefit', $bd_psapb['proposal_benefit']);
                    $props->put('problem_statement', $bd_psapb['problem_statement']);
                    $props->put('explain_proposal_roadmap', $bd_psapb['explain_proposal_roadmap']);
                    $props->put('supplementary_endorsement', $bd_psapb['supplementary_endorsement']);

                    if (! isset($attributes['bd_proposal_detail'])) {
                        throw new \Exception('Malformed data.');
                    }

                    $bd_proposal_detail = $attributes['bd_proposal_detail']['data']['attributes'];
                    $props->put('experience', $bd_proposal_detail['experience']);
                    $props->put('proposal_name', $bd_proposal_detail['proposal_name']);
                    $props->put('key_dependencies', $bd_proposal_detail['key_dependencies']);
                    $props->put('other_contract_type', $bd_proposal_detail['other_contract_type']);
                    $props->put('maintain_and_support', $bd_proposal_detail['maintain_and_support']);
                    $props->put('proposal_description', $bd_proposal_detail['proposal_description']);
                    $props->put('key_proposal_deliverables', $bd_proposal_detail['key_proposal_deliverables']);
                    $props->put('resourcing_duration_estimates', $bd_proposal_detail['resourcing_duration_estimates']);

                    if (! isset($bd_psapb['type_name'])) {
                        throw new \Exception('Malformed data.');
                    }

                    $type_name = $bd_psapb['type_name']['data']['attributes'];
                    $props->put('budget_cat', $type_name['type_name']);

                    if (! isset($attributes['bd_proposal_detail'])) {
                        throw new \Exception('Malformed data.');
                    }

                    $creator = $attributes['creator']['data'];

                    $props->put('govtool_user_id', $creator['id']);
                    $props->put('govtool_username', $creator['attributes']['govtool_username']);

                    CardanoBudgetProposal::updateOrCreate(
                        [
                            'govtool_proposal_id' => $proposal['id'],
                            'govtool_user_id' => $creator['id'],
                        ],
                        $props->toArray()
                    );
                });

            }

            $page++;
            sleep(10);
        } while (! empty($authResponse->collect()->get('data')));
    }
}
