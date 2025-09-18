<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\IdeascaleProfile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixIdeascaleProfilesCount extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ideascale-profiles:fix-proposals-count {--reindex : Also reindex to search engine}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix proposals_count for IdeascaleProfile models and optionally reindex them';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting IdeascaleProfile proposals_count fix...');

        // Get all profiles with their current counts
        $profiles = IdeascaleProfile::withCount('proposals')->get();

        $this->info("Processing {$profiles->count()} IdeascaleProfile records...");

        $updatedCount = 0;
        $bar = $this->output->createProgressBar($profiles->count());

        foreach ($profiles as $profile) {
            try {
                // Get the actual count using our new method
                $actualCount = $profile->getProposalsCount();

                // Log discrepancies
                if ($profile->proposals_count != $actualCount) {
                    $this->line("\nProfile {$profile->id} ({$profile->name}): DB count = {$profile->proposals_count}, Actual count = {$actualCount}");
                    $updatedCount++;
                }

                // Force update the count in search index by touching the model
                if ($this->option('reindex')) {
                    $profile->searchable();
                }

            } catch (\Exception $e) {
                $this->error("\nError processing profile {$profile->id}: ".$e->getMessage());
            }

            $bar->advance();
        }

        $bar->finish();

        $this->newLine();
        $this->info("Found {$updatedCount} profiles with incorrect counts");

        if ($this->option('reindex')) {
            $this->info('Reindexing all IdeascaleProfile records...');

            // Clear and rebuild the entire index
            IdeascaleProfile::removeAllFromSearch();
            IdeascaleProfile::makeAllSearchable();

            $this->info('Reindexing completed!');
        } else {
            $this->info('Run with --reindex flag to update search indexes');
        }

        // Show some statistics
        $this->newLine();
        $this->info('=== Statistics ===');

        $totalWithProposals = DB::table('ideascale_profiles')
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('proposal_profiles')
                    ->whereRaw('proposal_profiles.profile_type = ?', ['App\\Models\\IdeascaleProfile'])
                    ->whereRaw('CAST(proposal_profiles.profile_id as VARCHAR) = CAST(ideascale_profiles.id as VARCHAR)');
            })
            ->count();

        $totalWithoutProposals = IdeascaleProfile::count() - $totalWithProposals;

        $this->info("Profiles with proposals: {$totalWithProposals}");
        $this->info("Profiles without proposals: {$totalWithoutProposals}");

        $this->info('Done!');

        return Command::SUCCESS;
    }
}
