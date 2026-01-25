<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\MergeCatalystProfileJob;
use App\Models\Transaction;
use Illuminate\Console\Command;

class MergeDuplicateCatalystProfiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'catalyst:merge-duplicate-profiles 
                            {--stake-key= : Optional specific stake key to process}
                            {--chunk=100 : Chunk size for processing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Merge duplicate Catalyst profiles based on transaction key rotation history bound by stake key';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $specificStakeKey = $this->option('stake-key');
        $chunkSize = (int) $this->option('chunk');

        $query = Transaction::query()
            ->select('stake_key')
            ->where('type', 'x509_envelope')
            ->whereNotNull('stake_key')
            ->distinct();

        if ($specificStakeKey) {
            $query->where('stake_key', $specificStakeKey);
        }

        $this->info('Fetching unique stake keys...');

        $query->cursor()->each(function ($tx) {
            if (empty($tx->stake_key)) {
                return;
            }

            $this->info("Dispatching job for stake key: {$tx->stake_key}");
            MergeCatalystProfileJob::dispatch($tx->stake_key);
        });

        $this->info('Dispatch complete.');
    }
}
