<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Proposal;
use App\Services\ProposalAiSummaryService;
use Illuminate\Console\Command;

class GenerateProposalAiSummaries extends Command
{
    protected $signature = 'proposals:generate-ai-summaries
                           {--batch-size=50 : Number of proposals per batch}
                           {--force : Regenerate summaries even if they exist}
                           {--limit= : Maximum number of proposals to process}
                           {--fund= : Only process proposals from this fund ID}';

    protected $description = 'Generate AI summaries for proposals that do not have one yet';

    public function handle(ProposalAiSummaryService $service): int
    {
        $batchSize = (int) $this->option('batch-size');
        $force = (bool) $this->option('force');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;
        $fundId = $this->option('fund');

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

        $this->info("Processing {$total} proposals...");

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $processed = 0;
        $failed = 0;

        $query->chunkById($batchSize, function ($proposals) use ($service, $force, $limit, &$processed, &$failed, $bar) {
            foreach ($proposals as $proposal) {
                if ($limit && $processed >= $limit) {
                    return false;
                }

                $result = $service->generate($proposal, $force);
                if ($result === null) {
                    $failed++;
                }

                $processed++;
                $bar->advance();
            }

            return true;
        });

        $bar->finish();
        $this->newLine();

        $succeeded = $processed - $failed;
        $this->info("Generated {$succeeded} AI summaries. {$failed} failed. {$processed} total processed.");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}
