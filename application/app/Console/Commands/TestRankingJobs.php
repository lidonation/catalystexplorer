<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\UpdateApprovalChanceJob;
use App\Jobs\UpdateCategoryRankJob;
use App\Jobs\UpdateFundRankJob;
use App\Jobs\UpdateOverallRankJob;
use Illuminate\Console\Command;

class TestRankingJobs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:ranking-jobs {job? : Specific job to run (overall|fund|category|approval)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test individual ranking job components';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $jobType = $this->argument('job');

        if (! $jobType) {
            $this->info('Available jobs: overall, fund, category, approval');
            $jobType = $this->choice('Which job would you like to run?', [
                'overall' => 'Update Overall Rankings',
                'fund' => 'Update Fund Rankings',
                'category' => 'Update Category Rankings',
                'approval' => 'Update Approval Chances',
            ], 'overall');
        }

        $this->info("Running {$jobType} ranking job...");

        try {
            switch ($jobType) {
                case 'overall':
                    (new UpdateOverallRankJob)->handle();
                    $this->info('✅ Overall rankings updated successfully');
                    break;

                case 'fund':
                    (new UpdateFundRankJob)->handle();
                    $this->info('✅ Fund rankings updated successfully');
                    break;

                case 'category':
                    (new UpdateCategoryRankJob)->handle();
                    $this->info('✅ Category rankings updated successfully');
                    break;

                case 'approval':
                    (new UpdateApprovalChanceJob)->handle();
                    $this->info('✅ Approval chances updated successfully');
                    break;

                default:
                    $this->error("Unknown job type: {$jobType}");

                    return Command::FAILURE;
            }

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Job failed: '.$e->getMessage());
            $this->error('File: '.$e->getFile().' Line: '.$e->getLine());

            return Command::FAILURE;
        }
    }
}
