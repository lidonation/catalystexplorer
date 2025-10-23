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

        $records = [];

        foreach ($this->chunk as $row) {
            $stakeAddress = $row[0] ?? null;
            $votingPower = $row[1] ?? null;

            if (! is_string($stakeAddress) || $stakeAddress === '') {
                continue;
            }

            if (! is_numeric($votingPower)) {
                continue;
            }

            $records[] = [
                'voter_id' => $stakeAddress,
                'snapshot_id' => $this->snapshotId,
                'voting_power' => $votingPower,
            ];
        }

        if (empty($records)) {
            return;
        }

        VotingPower::upsert(
            $records,
            ['voter_id', 'snapshot_id'],
            ['voting_power']
        );
    }
}
