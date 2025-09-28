<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\UpdateTallyRank;
use App\Models\CatalystTally;
use Illuminate\Console\Command;

class TestApprovalChance extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:approval-chance {--run-update}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the approval chance calculation functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Approval Chance Calculation...');

        if ($this->option('run-update')) {
            $this->info('Running parallelized UpdateTallyRank job batch...');
            $job = new UpdateTallyRank;
            $job->handle();
            $this->info('Batch job dispatched. Check queue status for completion.');
        }

        // Show some sample tallies with their approval chances
        $this->info('\nSample tallies with approval chances:');
        $this->table(
            ['ID', 'Tally', 'Category Rank', 'Approval Chance %', 'Campaign ID'],
            CatalystTally::with(['metas', 'proposal'])
                ->whereHas('metas', fn ($q) => $q->where('key', 'chance'))
                ->limit(10)
                ->get()
                ->map(function ($tally) {
                    return [
                        $tally->id,
                        $tally->tally,
                        $tally->category_rank ?? 'N/A',
                        $tally->chance ?? 'N/A',
                        $tally->proposal?->campaign_id ?? 'N/A',
                    ];
                })
                ->toArray()
        );

        $this->info('\nTotal tallies with approval chance data: '.
            CatalystTally::whereHas('metas', fn ($q) => $q->where('key', 'chance'))->count()
        );

        return Command::SUCCESS;
    }
}
