<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\CatalystFunds;
use App\Jobs\UpdateTallyRank;
use Illuminate\Console\Command;

class TestApprovalChanceUpdated extends Command
{
    protected $signature = 'test:approval-chance-updated {--fund=14 : Fund ID to test}';

    protected $description = 'Test the updated approval chance calculation with range-based matching';

    public function handle(): int
    {
        $fundId = $this->option('fund') ?: CatalystFunds::FOURTEEN;

        $this->info("Running UpdateTallyRank for Fund {$fundId} with range-based matching...");

        try {
            $job = new UpdateTallyRank($fundId);
            $job->handle();

            $this->info("✅ UpdateTallyRank completed successfully for Fund {$fundId}!");
            $this->info('Check the logs for detailed calculation information.');
            $this->info('You can now check the approval and funding chances in the UI.');

        } catch (\Throwable $e) {
            $this->error('❌ UpdateTallyRank failed:');
            $this->error($e->getMessage());

            return 1;
        }

        return 0;
    }
}
