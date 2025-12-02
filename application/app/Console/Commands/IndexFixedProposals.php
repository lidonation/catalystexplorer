<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Proposal;
use Illuminate\Console\Command;

class IndexFixedProposals extends Command
{
    protected $signature = 'scout:index-fixed-proposals';

    protected $description = 'Index the 25 recently fixed proposals into Scout search';

    public function handle()
    {
        $this->info("Indexing the 25 fixed proposals into Scout...\n");

        // Get the most recently updated proposals (the ones we just fixed)
        $recentlyUpdated = Proposal::whereNotNull('campaign_id')
            ->orderBy('updated_at', 'desc')
            ->limit(25)
            ->get();

        $this->info("Found {$recentlyUpdated->count()} proposals to index");

        $indexed = 0;
        $failed = 0;

        foreach ($recentlyUpdated as $index => $proposal) {
            try {
                // Index the proposal using Scout
                $proposal->searchable();
                $indexed++;

                $this->line("✓ Indexed: {$proposal->title}");

                // Add a small delay to avoid overwhelming the search service
                usleep(100000); // 100ms delay

            } catch (\Exception $e) {
                $failed++;
                $this->error("✗ Failed to index: {$proposal->title}");
                $this->error("  Error: {$e->getMessage()}");
            }
        }

        $this->newLine();
        $this->info('Indexing Results:');
        $this->line("- Successfully indexed: {$indexed} proposals");
        $this->line("- Failed to index: {$failed} proposals");

        if ($indexed > 0) {
            $this->info('✓ Proposals have been successfully indexed into Scout search!');
        }

        return Command::SUCCESS;
    }
}
