<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Http\Integrations\CatalystMilestone\CatalystMilestoneModuleConnector;
use App\Http\Integrations\CatalystMilestone\Requests\GetAllProjectSchedulesRequest;
use App\Jobs\SyncProjectSchedulesFromCatalystJob;
use Illuminate\Console\Command;
use Saloon\Http\Response;

class SyncMilestoneFromCatalyst extends Command
{
    protected array $catalystProjectSchedules = [];

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:milestones
                            {--sync : Run synchronously instead of dispatching to queue}
                            {--limit= : Limit the number of project schedules to process}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Catalyst Milestones (supports both sync and async modes)';

    public function handle(): void
    {
        $syncMode = $this->option('sync');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;

        $this->info('Fetching project schedules...');
        $this->getAllProjectSchedules($limit);

        if (empty($this->catalystProjectSchedules)) {
            $this->warn('No project schedules found.');

            return;
        }

        $count = count($this->catalystProjectSchedules);
        $this->info("Found {$count} project schedule(s).");

        if ($syncMode) {
            $this->info('Running in SYNC mode...');
            $this->processSynchronously();
        } else {
            $this->info('Running in ASYNC mode (dispatching to queue)...');
            $this->processAsynchronously();
        }

        $this->info('Milestone sync initiated successfully.');
    }

    protected function getAllProjectSchedules(?int $limit = null): void
    {
        $milestoneConnector = new CatalystMilestoneModuleConnector;
        $promise = $milestoneConnector->sendAsync(
            new GetAllProjectSchedulesRequest(offset: null, limit: $limit)
        );

        $promise
            ->then(function (Response $response) {
                $this->catalystProjectSchedules = $response->json();
            })
            ->otherwise(function (\Exception $e) {
                $this->error('Failed to fetch project schedules: '.$e->getMessage());
            });

        $promise->wait();
    }

    protected function processSynchronously(): void
    {
        $bar = $this->output->createProgressBar(count($this->catalystProjectSchedules));
        $bar->start();

        foreach ($this->catalystProjectSchedules as $projectSchedule) {
            try {
                // Create job with syncMode=true so it runs milestone job synchronously
                $job = new SyncProjectSchedulesFromCatalystJob($projectSchedule, syncMode: true);
                $job->handle();

                $bar->advance();
            } catch (\Exception $e) {
                $this->error("\nError processing {$projectSchedule['title']}: ".$e->getMessage());
            }
        }

        $bar->finish();
        $this->newLine();
    }

    protected function processAsynchronously(): void
    {
        collect($this->catalystProjectSchedules)
            ->each(fn ($projectSchedule) => SyncProjectSchedulesFromCatalystJob::dispatch($projectSchedule)
            );
    }
}
