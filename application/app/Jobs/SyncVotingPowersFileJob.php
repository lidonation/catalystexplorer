<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Snapshot;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\LazyCollection;

class SyncVotingPowersFileJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // public $afterCommit = true;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected Snapshot $snapshot,
        protected string $disk,
        protected string $path,
        protected array $header
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $stream = Storage::disk($this->disk)->readStream($this->path);

        if ($stream === false) {
            Log::warning(sprintf(
                'Unable to read voting power snapshot from disk "%s" at "%s".',
                $this->disk,
                $this->path
            ));

            return;
        }

        $normalizedHeader = array_map(static fn ($value) => strtolower((string) $value), $this->header);
        $snapshotId = (string) $this->snapshot->getKey();

        if ($snapshotId === '') {
            Log::warning('Snapshot id missing while syncing voting powers.');

            return;
        }

        LazyCollection::make(function () use ($stream) {
            try {
                while (($line = fgetcsv($stream, 0)) !== false) {
                    yield $line;
                }
            } finally {
                fclose($stream);
            }
        })
            ->skip(1)
            ->chunk(500)
            ->each(function (LazyCollection $chunk) use ($normalizedHeader, $snapshotId) {
                $normalizedChunk = $chunk->map(function (array $row) use ($normalizedHeader) {
                    if ($normalizedHeader === ['stake_address', 'voting_power']) {
                        return [
                            $row[0] ?? null,
                            $row[1] ?? null,
                        ];
                    }

                    return [
                        $row[1] ?? null,
                        $row[0] ?? null,
                    ];
                })->filter(function (array $row) {
                    return ($row[0] ?? null) !== null || ($row[1] ?? null) !== null;
                });

                $payload = $normalizedChunk
                    ->map(static function (array $row) {
                        $stakeAddress = is_string($row[0] ?? null) ? trim($row[0]) : ($row[0] ?? null);
                        $votingPower = $row[1] ?? null;

                        if (is_string($votingPower)) {
                            $votingPower = trim($votingPower);
                        }

                        return [$stakeAddress, $votingPower];
                    })
                    ->filter(function (array $row) {
                        return ($row[0] ?? '') !== '' && ($row[1] ?? '') !== '';
                    })
                    ->values()
                    ->all();

                if ($payload === []) {
                    return;
                }

                CreateVotingPowerSnapshotJob::dispatch($payload, $snapshotId);
            });
    }
}
