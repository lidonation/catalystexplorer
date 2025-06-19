<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;

class IndexManagementCommand extends Command
{
    protected $signature = 'search:index
                            {action : create|import|flush|delete|seed}
                            {filter? : Optional filter for model or index}';

    protected $description = 'Manage search indexes for scout';

    protected $models = [
        'App\\Models\\Voter',
        'App\\Models\\BookmarkCollection',
        'App\\Models\\ProjectSchedule',
        'App\\Models\\Community',
        'App\\Models\\Proposal',
        'App\\Models\\IdeascaleProfile',
        'App\\Models\\Group',
        'App\\Models\\Review',
        'App\\Models\\MonthlyReport',
        'App\\Models\\Transaction',
        'App\\Models\\VoterHistory',
    ];

    protected $indexes = [
        'cx_bookmark_collections',
        'cx_proposals',
        'cx_communities',
        'cx_ideascale_profiles',
        'cx_monthly_reports',
        'cx_review',
        'cx_groups',
        'cx_transactions',
        'cx_voter_histories',
    ];

    public function handle()
    {
        $action = $this->argument('action');
        $filter = strtolower($this->argument('filter') ?? '');

        if ($action === 'seed') {
            $this->call('db:seed', ['--class' => 'SearchIndexSeeder']);

            return;
        }

        if ($action === 'delete') {
            foreach ($this->indexes as $index) {
                if (! $filter || str_contains(strtolower($index), $filter)) {
                    $this->info("Deleting index: $index");
                    $this->call('scout:delete-index', ['name' => $index]);
                }
            }

            return;
        }

        foreach ($this->models as $model) {
            if (! $filter || str_contains(strtolower($model), $filter)) {
                switch ($action) {
                    case 'create':
                        $this->call('cx:create-search-index', ['model' => $model]);
                        break;
                    case 'import':
                        $this->call('scout:import', ['model' => $model]);
                        break;
                    case 'flush':
                        $this->call('scout:flush', ['model' => $model]);
                        break;
                    default:
                        $this->error("Unsupported action: $action");

                        return;
                }
            }
        }
    }
}
