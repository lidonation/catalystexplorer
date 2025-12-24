<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\SyncVotingResults;
use App\Models\Fund;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncVotingResultsFromCatalyst extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'voting:sync-from-catalyst
                            {--fund= : Fund ID to sync voting results for}
                            {--challenge= : Specific challenge slug to sync}
                            {--sync : Run synchronously instead of queueing jobs}
                            {--update-details : Also update campaign ID and amount received}';

    /**
     * The console command description.
     */
    protected $description = 'Sync voting results from the Project Catalyst API';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $fundId = $this->option('fund');
        $challengeSlug = $this->option('challenge');
        $sync = $this->option('sync');
        $updateDetails = $this->option('update-details');

        if (! $fundId) {
            $this->error('❌ The --fund option is required.');
            $this->info('Example: php artisan voting:sync-from-catalyst --fund=019a9c61-7d7a-7277-b082-bd4137a5a936');

            return Command::FAILURE;
        }

        // Find fund by ID
        $fund = Fund::find($fundId);

        if (! $fund) {
            $this->error("❌ Fund not found: {$fundId}");

            return Command::FAILURE;
        }

        // Extract fund number from slug (e.g., "fund-14" -> "14")
        if (! preg_match('/fund-(\d+)/', $fund->slug, $matches)) {
            $this->error("❌ Invalid fund slug format: {$fund->slug}. Expected format: fund-{{number}} (e.g., fund-14)");

            return Command::FAILURE;
        }
        $fundNumber = $matches[1];

        $this->info("🚀 Starting voting results sync for Fund {$fundNumber} ({$fund->title})");

        if ($updateDetails) {
            $this->info('📝 Proposal details will also be updated (campaign ID and amount received)');
        }

        if ($challengeSlug) {
            $this->info("Syncing specific challenge: {$challengeSlug}");
            $this->syncChallenge($challengeSlug, $fundNumber, $fund->id, null, $sync, $updateDetails);
        } else {
            $this->info("Syncing all challenges for Fund {$fundNumber}");
            $this->syncAllChallenges($fundNumber, $fund->id, $sync, $updateDetails);
        }

        return Command::SUCCESS;
    }

    private function syncChallenge(string $challengeSlug, string $fundNumber, string $fundId, ?string $campaignSlug, bool $sync = false, bool $updateDetails = false): void
    {
        if ($sync) {
            $this->info("⏳ Syncing challenge {$challengeSlug} synchronously...");
            try {
                $job = new SyncVotingResults($challengeSlug, $fundNumber, $fundId, $challengeSlug, $updateDetails);
                $job->handle();
                $this->info("✅ Successfully synced challenge: {$challengeSlug}");
            } catch (\Throwable $e) {
                $this->error("❌ Failed to sync challenge {$challengeSlug}: ".$e->getMessage());
                Log::error('Command sync failed', [
                    'challenge' => $challengeSlug,
                    'error' => $e->getMessage(),
                ]);
            }
        } else {
            $this->info("📋 Queuing challenge: {$challengeSlug}");
            SyncVotingResults::dispatch($challengeSlug, $fundNumber, $fundId, $challengeSlug, $updateDetails);
            $this->info("✅ Queued job for challenge: {$challengeSlug}");
        }
    }

    private function syncAllChallenges(string $fundNumber, string $fundId, bool $sync = false, bool $updateDetails = false): void
    {
        $challenges = $this->getFundChallenges($fundNumber);

        if (empty($challenges)) {
            $this->warn("⚠️ No challenges configured for Fund {$fundNumber}");
            $this->info('Available challenge mappings:');
            $this->info('- Fund 14: cardano-open-developers, cardano-open-ecosystem, cardano-use-cases-concepts, cardano-use-cases-partners-and-products, sponsored-by-leftovers');

            return;
        }

        $jobsCount = 0;

        foreach ($challenges as $challengeSlug => $campaignSlug) {
            $this->syncChallenge($challengeSlug, $fundNumber, $fundId, $campaignSlug, $sync, $updateDetails);
            $jobsCount++;
        }

        if ($sync) {
            $this->info("🎉 Completed synchronous sync of {$jobsCount} challenges");
        } else {
            $this->info("🎉 Queued {$jobsCount} voting sync jobs successfully");
        }
    }

    /**
     * Get challenge mappings for a specific fund
     */
    protected function getFundChallenges(string $fundNumber): array
    {
        $challengeMappings = [
            '10' => [
                'catalyst-fund-operations' => 'f10-catalyst-fund-operations',
                'catalyst-open' => 'f10-catalyst-open',
                'atala-prism-launch-ecosystem' => 'f10-atala-prism-launch-ecosystem',
                'catalyst-systems-improvements' => 'f10-catalyst-systems-improvements',
                'daos-cardano' => 'f10-daos-heart-cardano',
                'development-and-infrastructure' => 'f10-development-infrastructure',
                'spo-tools-and-community-projects' => 'f10-spo-tool-and-community-projects',
                'drep-improvement-and-onboarding' => 'f10-drep-improvement-and-onboarding',
                'osde-open-source-dev-ecosystem' => 'f10-osde-open-source-dev-ecosystem',
                'building-on-nmkr' => 'f10-building-on-nmkr',
                'developer-ecosystem-the-evolution' => 'f10-developer-ecosystem-the-evolution',
                'products-and-integrations' => 'f10-products-and-intergrations',
                'startups-and-onboarding-for-students' => 'f10-startups-and-onboarding-for-students',
                'sponsored-by-leftovers' => null, // null indicates leftover funding
            ],
            '11' => [
                'cardano-use-cases-concept' => 'f11-cardano-use-cases-concept',
                'cardano-use-cases-solution' => 'f11-cardano-use-cases-solution',
                'cardano-use-cases-product' => 'f11-cardano-use-cases-product',
                'cardano-open-developers' => 'f11-cardano-open-developers-technical',
                'cardano-open-ecosystem' => 'f11-cardano-open-ecosystem-non-technical',
                'catalyst-systems-improvements-discovery' => 'f11-catalyst-systems-improvements-development',
                'sponsored-by-leftovers' => null, // null indicates leftover funding
            ],
            '12' => [
                'cardano-open-ecosystem' => 'cardano-open-ecosystem-f12',
                'cardano-use-cases-product' => 'cardano-use-cases-product-f12',
                'cardano-use-cases-mvp' => 'cardano-use-cases-mvp-f12',
                'cardano-use-cases-concept' => 'cardano-use-cases-concept-f12',
                'cardano-partners-and-real-world-integrations' => 'cardano-partners-developers-real-world-intergrations-f12',
                'cardano-open-developers' => 'cardano-open-developers-f12',
                'sponsored-by-leftovers' => null, // null indicates leftover funding
            ],
            '13' => [
                'cardano-open-developers' => 'cardano-open-developers-f13',
                'cardano-open-ecosystem' => 'cardano-open-echo-system-f13',
                'cardano-use-cases-concept' => 'cardano-use-cases-concept-f13',
                'cardano-use-cases-product' => 'cardano-use-cases-product-f13',
                'cardano-partners-enterprise-randd' => 'cardano-partners-enterprise-f13',
                'cardano-partners-growth-and-acceleration' => 'cardano-partners-growth-f13',
                'sponsored-by-leftovers' => null,
            ],
            '14' => [
                'cardano-open-developers' => 'cardano-open-developers-f14',
                'cardano-open-ecosystem' => 'cardano-open-ecosystem-f14',
                'cardano-use-cases-concepts' => 'cardano-use-case-concept-f14',
                'cardano-use-cases-partners-and-products' => 'cardano-use-case-partners-and-products-f14',
                'sponsored-by-leftovers' => null, // null indicates leftover funding
            ],
            // Add more funds as needed
            // '15' => [...],
        ];

        return $challengeMappings[$fundNumber] ?? [];
    }
}
