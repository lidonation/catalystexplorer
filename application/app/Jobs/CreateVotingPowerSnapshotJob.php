<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\VotingPower;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\LazyCollection;

class CreateVotingPowerSnapshotJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(protected LazyCollection $chunk, protected string $snapshotId)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->chunk->each(function ($row) {
            if (is_numeric($row[1])) {
                VotingPower::create([
                    'voter_id' => $row[0],
                    'voting_power' => $row[1] * 1000000,
                    'snapshot_id' => $this->snapshotId,
                ]);
            }
        });
    }
}
