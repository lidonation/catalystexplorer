<?php

namespace App\Actions;

use App\Jobs\SyncVotingPowersFileJob;
use App\Models\Fund;
use App\Models\Meta;
use App\Models\Snapshot;
use App\Models\VotingPower;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\ActionFields;
use Laravel\Nova\Fields\File as FileField;
use Laravel\Nova\Http\Requests\NovaRequest;

class ImportVotingPower extends Action
{
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
        $models->each(function (Snapshot $snapshot) use ($fields) {
            Log::info('Importing voting powers for snapshot '.$snapshot->id);
            try {
                $fund = Fund::find($snapshot->model_id);

                $directory = 'catalyst_snapshots';
                $storageDirectory = storage_path('app/public/'.$directory);
                $fileName = 'catalyst-snapshot-'.$fund->slug.'.'.$fields->file->getClientOriginalExtension();
                $storagePath = 'app/public/catalyst_snapshots/'.$fileName;
                $fullFilePath = $storageDirectory.'/'.$fileName;

                Log::info('Importing voting powers for snapshot '.$snapshot->id.' from file '.$fullFilePath);

                // save then format the file
                $fields->file->move($storageDirectory, $fileName);
                $this->formatCSV($fullFilePath, $storagePath);

                // delete existing snapshot records
                $this->deleteExistingRecords($snapshot);

                // save snapshot's metadata about file
                $this->saveSnapshotMeta($snapshot, $directory, $fileName);

                $header = $this->getFirstLine($storagePath);
                SyncVotingPowersFileJob::dispatch($snapshot, $fullFilePath, $header);
            } catch (\Exception $e) {
                $this->markAsFailed($snapshot, $e);
            }
        });
    }

    protected function deleteExistingRecords(Snapshot $snapshot): void
    {
        // delete file details metadata
        $metaData = Meta::where('key', 'snapshot_file_path')
            ->where('model_type', Snapshot::class)
            ->where('model_id', $snapshot->id);
        $metaData->delete();

        // delete related voting powers
        $powers = VotingPower::where('snapshot_id', $snapshot->id);
        $powers->delete();
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

    protected function formatCSV($fullPath, $storagePath): void
    {
        $expectedHeaders = ['stake_address', 'voting_power'];
        $csvHeaders = $this->getFirstLine($storagePath);

        if ($expectedHeaders !== $csvHeaders) {
            // if either is numeric then no header is provided
            if (! is_numeric($csvHeaders[0]) && ! is_numeric($csvHeaders[1])) {
                // remove the current headers that dont conform
                $lines = $this->getFileLines($storagePath);
                array_shift($lines);
                $newFileContents = implode("\n", $lines);
                Storage::put($storagePath, $newFileContents);

                // read the file again and add headers based on column arrangements
                $csvHeaders = $this->getFirstLine($storagePath);

            }
            $header = is_numeric($csvHeaders[1]) ? "stake_address,voting_power\n" : "voting_power,stake_address\n";
            File::prepend($fullPath, $header);
        }
    }

    protected function getFirstLine($filePath): array
    {
        $lines = $this->getFileLines($filePath);

        return str_getcsv($lines[0]);
    }

    protected function getFileLines($filePath): array
    {
        $file = file_get_contents(storage_path($filePath));

        return explode("\n", $file);
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
