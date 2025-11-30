<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Campaign;
use App\Models\Proposal;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixCPokerCampaign extends Command
{
    protected $signature = 'proposals:fix-cpoker-campaign';

    protected $description = 'Fix cPoker Development campaign assignment to Products & Integrations';

    public function handle()
    {
        $this->info("Finding and updating cPoker Development campaign assignment...\n");

        // Find cPoker Development using raw SQL to avoid JSON type issues
        $cPokerResults = DB::select(
            'SELECT id, title::text, fund_id, campaign_id FROM proposals WHERE deleted_at IS NULL AND title::text ILIKE ? LIMIT 1',
            ['%cPoker%']
        );

        if (empty($cPokerResults)) {
            $this->error('cPoker Development proposal not found!');

            return Command::FAILURE;
        }

        $cPokerData = $cPokerResults[0];
        $this->info('Found cPoker Development proposal:');
        $this->line("- ID: {$cPokerData->id}");
        $this->line("- Current Campaign ID: {$cPokerData->campaign_id}");
        $this->line("- Fund ID: {$cPokerData->fund_id}");

        // Find Products & Integrations campaign in the same fund
        $campaigns = DB::select('SELECT id, title FROM campaigns WHERE fund_id = ? ORDER BY title', [$cPokerData->fund_id]);

        $this->info("\nAvailable campaigns in this fund:");
        foreach ($campaigns as $campaign) {
            $this->line("- {$campaign->title} (ID: {$campaign->id})");
        }

        // Look for Products & Integrations campaign
        $productsIntegrationsCampaign = null;
        foreach ($campaigns as $campaign) {
            if (stripos($campaign->title, 'Products') !== false &&
                (stripos($campaign->title, 'Integration') !== false || stripos($campaign->title, 'Product') !== false)) {
                $productsIntegrationsCampaign = $campaign;
                break;
            }
        }

        if ($productsIntegrationsCampaign) {
            $this->info("\nFound Products & Integrations campaign:");
            $this->line("- {$productsIntegrationsCampaign->title} (ID: {$productsIntegrationsCampaign->id})");

            // Update the proposal
            DB::update(
                'UPDATE proposals SET campaign_id = ? WHERE id = ?',
                [$productsIntegrationsCampaign->id, $cPokerData->id]
            );

            $this->info("\n✓ Successfully updated cPoker Development campaign assignment!");
            $this->line("  → Assigned to: {$productsIntegrationsCampaign->title}");

            // Index into Scout
            try {
                $proposal = Proposal::find($cPokerData->id);
                if ($proposal) {
                    $proposal->searchable();
                    $this->info('✓ Successfully indexed into Scout search!');
                }
            } catch (\Exception $e) {
                $this->warn("Campaign updated but indexing failed: {$e->getMessage()}");
            }

        } else {
            $this->warn('Products & Integrations campaign not found in this fund.');
            $this->info('Please manually assign the campaign using one of the available campaigns above.');
        }

        return Command::SUCCESS;
    }
}
