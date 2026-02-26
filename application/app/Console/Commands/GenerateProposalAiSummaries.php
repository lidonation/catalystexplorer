<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\GenerateProposalAiSummary;
use App\Models\Proposal;
use Illuminate\Console\Command;

class GenerateProposalAiSummaries extends Command
{
    protected $signature = 'proposals:generate-ai-summaries
                           {--batch-size=50 : Number of proposals per batch}
                           {--force : Regenerate summaries even if they exist}
                           {--limit= : Maximum number of proposals to process}
                           {--fund= : Only process proposals from this fund ID}
                           {--sync : Process synchronously instead of dispatching to queue}';

    protected $description = 'Generate AI summaries for proposals that do not have one yet';

    public function handle(): int
    {
        $batchSize = (int) $this->option('batch-size');
        $force = $this->option('force');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;
        $fundId = $this->option('fund');
        $sync = $this->option('sync');

        $query = Proposal::query()
            ->whereNotNull('problem')
            ->whereNotNull('solution');

        if (! $force) {
            $query->whereNull('ai_generated_at');
        }

        if ($fundId) {
            $query->where('fund_id', $fundId);
        }

        $total = $limit ? min($limit, $query->count()) : $query->count();

        if ($total === 0) {
            $this->info('No proposals need AI summary generation.');

            return self::SUCCESS;
        }

        $this->info("Processing {$total} proposals".($sync ? ' synchronously' : ' via queue').'...');

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $processed = 0;

        $query->chunkById($batchSize, function ($proposals) use ($force, $sync, $limit, &$processed, $bar) {
            foreach ($proposals as $proposal) {
                if ($limit && $processed >= $limit) {
                    return false;
                }

                if ($sync) {
                    GenerateProposalAiSummary::dispatchSync($proposal, $force);
                } else {
                    GenerateProposalAiSummary::dispatch($proposal, $force)
                        ->onQueue('ai');
                }

                $processed++;
                $bar->advance();
            }

            return true;
        });

        $bar->finish();
        $this->newLine();
        $this->info("Dispatched {$processed} AI summary ".($sync ? 'jobs (sync)' : 'jobs to the ai queue').'.');

        return self::SUCCESS;
    }
}
