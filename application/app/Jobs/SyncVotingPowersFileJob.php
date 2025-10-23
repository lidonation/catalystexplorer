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
        $normalizedHeader = array_map(static fn ($value) => strtolower((string) $value), $this->header);
        $snapshotId = (string) $this->snapshot->getKey();

        if ($snapshotId === '') {
            Log::warning('Snapshot id missing while syncing voting powers.');

            return;
        }

        $layout = $this->detectLayout($normalizedHeader);

        if ($layout === null) {
            Log::warning(sprintf(
                'Unable to determine layout for voting power snapshot on disk "%s" at "%s".',
                $this->disk,
                $this->path
            ));

            return;
        }

        $stream = Storage::disk($this->disk)->readStream($this->path);

        if ($stream === false) {
            Log::warning(sprintf(
                'Unable to read voting power snapshot from disk "%s" at "%s".',
                $this->disk,
                $this->path
            ));

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
            ->skip($layout['skip'])
            ->chunk(500)
            ->each(function (LazyCollection $chunk) use ($layout, $snapshotId) {
                $payload = $chunk
                    ->map(function (array $row) use ($layout) {
                        $normalized = $this->normalizeRow($row);

                        $stakeAddress = $normalized[$layout['stake_index']] ?? null;
                        $votingPower = $normalized[$layout['power_index']] ?? null;

                        return [$stakeAddress, $votingPower];
                    })
                    ->filter(function (array $row) {
                        $stakeAddress = $row[0] ?? null;
                        $votingPower = $row[1] ?? null;

                        if (! is_string($stakeAddress)) {
                            return false;
                        }

                        $stakeAddress = $this->cleanString($stakeAddress);
                        $votingPower = is_string($votingPower) ? $this->cleanString($votingPower) : $votingPower;

                        return $stakeAddress !== ''
                            && $this->isLikelyStakeAddress($stakeAddress)
                            && $votingPower !== null
                            && $this->isNumericValue($votingPower);
                    })
                    ->map(function (array $row) {
                        $stakeAddress = $this->cleanString((string) $row[0]);
                        $votingPower = $row[1];

                        if (is_string($votingPower)) {
                            $votingPower = $this->cleanString($votingPower);
                        }

                        return [$stakeAddress, $votingPower];
                    })
                    ->values()
                    ->all();

                if ($payload === []) {
                    return;
                }

                CreateVotingPowerSnapshotJob::dispatch($payload, $snapshotId);
            });
    }

    protected function detectLayout(array $normalizedHeader): ?array
    {
        $stream = Storage::disk($this->disk)->readStream($this->path);

        if ($stream === false) {
            return null;
        }

        $skipRows = 0;
        $stakeIndex = $this->resolveStakeIndexFromHeader($normalizedHeader);
        $powerIndex = $this->resolvePowerIndexFromHeader($normalizedHeader);
        $maxRowsToInspect = 10;

        try {
            $inspected = 0;

            while ($inspected < $maxRowsToInspect && ($row = fgetcsv($stream, 0)) !== false) {
                $inspected++;

                if ($row === []) {
                    $skipRows++;
                    continue;
                }

                $normalizedRow = $this->normalizeRow($row);

                if ($this->isDataRow($normalizedRow)) {
                    if ($this->isLikelyStakeAddress($normalizedRow[0]) && $this->isNumericValue($normalizedRow[1])) {
                        $stakeIndex = 0;
                        $powerIndex = 1;
                    } elseif ($this->isLikelyStakeAddress($normalizedRow[1]) && $this->isNumericValue($normalizedRow[0])) {
                        $stakeIndex = 1;
                        $powerIndex = 0;
                    }

                    break;
                }

                $skipRows++;

                if ($stakeIndex === null || $powerIndex === null) {
                    $stakeIndex = $stakeIndex ?? $this->resolveStakeIndexFromHeader($normalizedRow);
                    $powerIndex = $powerIndex ?? $this->resolvePowerIndexFromHeader($normalizedRow);
                }
            }
        } finally {
            fclose($stream);
        }

        if ($stakeIndex === null || $powerIndex === null) {
            $stakeIndex = $stakeIndex ?? 0;
            $powerIndex = $powerIndex ?? 1;
        }

        if ($stakeIndex === $powerIndex) {
            return null;
        }

        return [
            'skip' => max(0, $skipRows),
            'stake_index' => $stakeIndex,
            'power_index' => $powerIndex,
        ];
    }

    /**
     * @param array<int, string|null> $row
     */
    protected function isDataRow(array $row): bool
    {
        if (count($row) < 2) {
            return false;
        }

        return (
            ($this->isLikelyStakeAddress($row[0]) && $this->isNumericValue($row[1]))
            || ($this->isLikelyStakeAddress($row[1]) && $this->isNumericValue($row[0]))
        );
    }

    protected function isLikelyStakeAddress(?string $value): bool
    {
        if ($value === null || $value === '') {
            return false;
        }

        return (bool) preg_match('/^(stake1|addr1|ca1)[0-9a-z]+$/i', $value);
    }

    /**
     * @param string|float|int|null $value
     */
    protected function isNumericValue($value): bool
    {
        if ($value === null) {
            return false;
        }

        if (is_numeric($value)) {
            return true;
        }

        if (is_string($value)) {
            return is_numeric($this->cleanString($value));
        }

        return false;
    }

    /**
     * @param array<int, string|null> $row
     * @return array<int, string>
     */
    protected function normalizeRow(array $row): array
    {
        return array_map(function ($value) {
            if ($value === null) {
                return '';
            }

            if (! is_string($value)) {
                $value = (string) $value;
            }

            return $this->cleanString($value);
        }, $row);
    }

    protected function cleanString(string $value): string
    {
        $value = preg_replace('/^\xEF\xBB\xBF/', '', $value) ?? $value;
        $value = trim($value);
        $value = trim($value, "\"'");

        return trim($value);
    }

    /**
     * @param array<int, string> $row
     */
    protected function resolveStakeIndexFromHeader(array $row): ?int
    {
        foreach ($row as $index => $value) {
            $value = strtolower($this->cleanString((string) $value));

            if (in_array($value, ['stake_address', 'stake address', 'stakeaddress', 'address'], true)) {
                return $index;
            }
        }

        return null;
    }

    /**
     * @param array<int, string> $row
     */
    protected function resolvePowerIndexFromHeader(array $row): ?int
    {
        foreach ($row as $index => $value) {
            $value = strtolower($this->cleanString((string) $value));

            if (in_array($value, ['voting_power', 'voting power', 'votingpower', 'value'], true)) {
                return $index;
            }
        }

        return null;
    }
}
