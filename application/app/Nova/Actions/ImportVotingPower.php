<?php

declare(strict_types=1);

namespace App\Nova\Actions;

use App\Jobs\SyncVotingPowersFileJob;
use App\Models\Fund;
use App\Models\Meta;
use App\Models\Snapshot;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\ActionFields;
use Laravel\Nova\Fields\File as FileField;
use Laravel\Nova\Http\Requests\NovaRequest;

class ImportVotingPower extends Action
{
    private const CSV_DELIMITER = ',';

    private const CSV_ENCLOSURE = '"';

    private const CSV_ESCAPE = '\\';

    //    use InteractsWithQueue, Queueable;

    /**
     * The displayable name of the action.
     *
     * @var string
     */
    public $name = 'Import Voting Powers';

    /**
     * Perform the action on the given models.
     */
    public function handle(ActionFields $fields, Collection $models): void
    {
        Log::info('Importing voting powers');
        $diskName = config('filesystems.default', 's3');

        $models->each(function (Snapshot $snapshot) use ($fields, $diskName) {
            Log::info('Importing voting powers for snapshot '.$snapshot->id);
            try {
                $fund = Fund::find($snapshot->model_id);

                if (! $fund) {
                    throw new \RuntimeException('Unable to locate fund for snapshot '.$snapshot->id);
                }

                $directory = 'catalyst_snapshots';
                $fileName = 'catalyst-snapshot-'.$fund->slug.'.'.$fields->file->getClientOriginalExtension();
                $path = $directory.'/'.$fileName;

                Log::info(
                    sprintf('Importing voting powers for snapshot %s to disk "%s" at "%s".', $snapshot->id, $diskName, $path)
                );

                $this->deleteExistingSnapshotFiles($snapshot, $diskName);

                [$storagePath, $header] = $this->storeSnapshotFile(
                    $fields->file,
                    $path,
                    $diskName
                );

                // save snapshot's metadata about file
                $this->saveSnapshotMeta($snapshot, $directory, $fileName);

                SyncVotingPowersFileJob::dispatch($snapshot, $diskName, $storagePath, $header);
            } catch (\Exception $e) {
                $this->markAsFailed($snapshot, $e);
            }
        });
    }

    protected function deleteExistingSnapshotFiles(Snapshot $snapshot, string $diskName): void
    {
        Meta::where('key', 'snapshot_file_path')
            ->where('model_type', Snapshot::class)
            ->where('model_id', $snapshot->id)
            ->get()
            ->each(function (Meta $meta) use ($diskName) {
                if (! empty($meta->content)) {
                    Storage::disk($diskName)->delete($meta->content);
                }
            });
    }

    protected function saveSnapshotMeta(Snapshot $snapshot, $directory, $fileName): void
    {
        $meta = new Meta;
        $meta->model_type = Snapshot::class;
        $meta->model_id = $snapshot->id;
        $meta->key = 'snapshot_file_path';
        $meta->content = $directory.'/'.$fileName;

        $meta->save();
    }

    /**
     * @return array{0: string, 1: array<int, string>}
     */
    protected function storeSnapshotFile(UploadedFile $file, string $path, string $diskName): array
    {
        $disk = Storage::disk($diskName);

        $inputPath = $file->getRealPath();

        if ($inputPath === false) {
            throw new \RuntimeException('Unable to access uploaded file contents.');
        }

        $inputHandle = fopen($inputPath, 'r');

        if ($inputHandle === false) {
            throw new \RuntimeException('Unable to open uploaded file for reading.');
        }

        $expectedHeaders = ['stake_address', 'voting_power'];
        $headerRow = $expectedHeaders;
        $outputHandle = null;

        try {
            $firstRow = $this->readCsvRow($inputHandle);

            if ($firstRow === false) {
                throw new \RuntimeException('Uploaded voting power file is empty.');
            }

            if ($this->rowMatchesHeader($firstRow, $expectedHeaders)) {
                rewind($inputHandle);
                $disk->put($path, $inputHandle);

                return [$path, $headerRow];
            }

            $maxHeaderRows = 10; // Safety limit
            $headerRowsSkipped = 0;
            $firstDataRow = $firstRow;

            while (! $this->isDataRow($firstDataRow) && $headerRowsSkipped < $maxHeaderRows) {
                $firstDataRow = $this->readCsvRow($inputHandle);
                $headerRowsSkipped++;

                if ($firstDataRow === false) {
                    throw new \RuntimeException('Unable to find data rows in uploaded voting power file.');
                }
            }

            $headerRow = $this->resolveHeaderFromRow($firstDataRow, $expectedHeaders);

            $outputHandle = fopen('php://temp', 'w+');

            if ($outputHandle === false) {
                throw new \RuntimeException('Unable to create temporary stream.');
            }

            $this->writeCsvRow($outputHandle, $headerRow);

            if ($firstDataRow !== false) {
                $this->writeCsvRow($outputHandle, $firstDataRow);
            }

            while (($row = $this->readCsvRow($inputHandle)) !== false) {
                $this->writeCsvRow($outputHandle, $row);
            }

            rewind($outputHandle);

            $disk->put($path, $outputHandle);

            return [$path, $headerRow];
        } finally {
            fclose($inputHandle);
            if (is_resource($outputHandle)) {
                fclose($outputHandle);
            }
        }
    }

    protected function readCsvRow($handle): array|false
    {
        if (! is_resource($handle)) {
            return false;
        }

        while (($row = fgetcsv($handle, 0, self::CSV_DELIMITER, self::CSV_ENCLOSURE, self::CSV_ESCAPE)) !== false) {
            if ($row === null) {
                continue;
            }

            $hasValue = false;

            foreach ($row as $value) {
                if ($value !== null && trim((string) $value) !== '') {
                    $hasValue = true;
                    break;
                }
            }

            if (! $hasValue) {
                continue;
            }

            return $row;
        }

        return false;
    }

    protected function rowMatchesHeader(array $row, array $expected): bool
    {
        $normalize = fn (array $values) => array_map(
            fn ($value) => strtolower($this->cleanString((string) $value)),
            array_slice($values, 0, count($expected))
        );

        return $normalize($row) === $normalize($expected);
    }

    protected function resolveHeaderFromRow(array|false $row, array $fallback): array
    {
        if ($row === false || count($row) < 2) {
            return $fallback;
        }

        $col0 = $this->cleanString((string) ($row[0] ?? ''));
        $col1 = $this->cleanString((string) ($row[1] ?? ''));

        // Check data patterns to determine actual column order
        if ($this->isLikelyStakeAddress($col0) && $this->isNumericValue($col1)) {
            // Column 0 is stake_address, Column 1 is voting_power
            return ['stake_address', 'voting_power'];
        }

        if ($this->isLikelyStakeAddress($col1) && $this->isNumericValue($col0)) {
            // Column 0 is voting_power, Column 1 is stake_address
            return ['voting_power', 'stake_address'];
        }

        // Cannot determine from data, use fallback
        return $fallback;
    }

    protected function writeCsvRow($handle, array $row): void
    {
        if (! is_resource($handle)) {
            return;
        }

        fputcsv($handle, $row, self::CSV_DELIMITER, self::CSV_ENCLOSURE, self::CSV_ESCAPE);
    }

    protected function cleanString(string $value): string
    {
        // Remove UTF-8 BOM if present
        $value = preg_replace('/^\xEF\xBB\xBF/', '', $value) ?? $value;
        $value = trim($value);
        // Remove surrounding quotes
        $value = trim($value, "\"'");

        return trim($value);
    }

    /**
     * Check if a value looks like a stake address.
     */
    protected function isLikelyStakeAddress(?string $value): bool
    {
        if ($value === null || $value === '') {
            return false;
        }

        return (bool) preg_match('/^(stake1|addr1|ca1)[0-9a-z]+$/i', $value);
    }

    /**
     * Check if a value is numeric (for voting power).
     */
    protected function isNumericValue(mixed $value): bool
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
     * Check if a row looks like a data row (not a header row).
     *
     * @param  array<int, string|null>  $row
     */
    protected function isDataRow(array $row): bool
    {
        if (count($row) < 2) {
            return false;
        }

        $col0 = $this->cleanString((string) ($row[0] ?? ''));
        $col1 = $this->cleanString((string) ($row[1] ?? ''));

        // Data row: one column is stake address, other is numeric voting power
        return ($this->isLikelyStakeAddress($col0) && $this->isNumericValue($col1))
            || ($this->isLikelyStakeAddress($col1) && $this->isNumericValue($col0));
    }

    /**
     * Get the fields available on the action.
     */
    public function fields(NovaRequest $request): array
    {
        return [
            FileField::make('Voting Power Snapshot', 'file'),
        ];
    }
}
