<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\PopulateConnections;
use App\Models\Proposal;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateConnections extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ln:generate-connections {--clear : Clear all connections first if necessary}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate entries for the connections table';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        if ($this->option('clear')) {

            $this->info('Clearing the connections table...');

            DB::table('connections')->truncate();

            $this->info('connections table cleared.');
        }

        $this->info('Dispatching PopulateConnections job for each proposal.');

        $proposals = Proposal::withOnly(['users', 'groups'])->cursor();
        foreach ($proposals as $proposal) {
            PopulateConnections::dispatch($proposal);
        }

        $this->info('All PopulateConnections jobs dispatched successfully.');
    }
}
