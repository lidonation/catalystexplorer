<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\VotingPower;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CreateVotingPowerSnapshotJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(protected array $chunk, protected string $snapshotId)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if ($this->snapshotId === '') {
            return;
        }

        foreach ($this->chunk as $row) {
            $stakeAddress = $row[0] ?? null;
            $votingPower = $row[1] ?? null;

            if (! is_string($stakeAddress) || $stakeAddress === '') {
                continue;
            }

            if (! is_numeric($votingPower)) {
                continue;
            }

            VotingPower::create([
                'voter_id' => $stakeAddress,
                'voting_power' => (int) round(((float) $votingPower) * 1000000),
                'snapshot_id' => $this->snapshotId,
            ]);
        }
    }
}
