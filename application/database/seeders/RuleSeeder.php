<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Rule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use OpenSpout\Reader\CSV\Reader as CSVReader;

class RuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Rule::factory()->count(5)->create();
        Rule::factory()->count(5)->homeMetricRule()->create();

        $csvPath = database_path('data/rules.csv');

        if (!file_exists($csvPath)) {
            $this->command->warn("Rules CSV file not found at: {$csvPath}");
            return;
        }

        $reader = new CSVReader();
        $reader->open($csvPath);

        $headers = [];
        $batchData = [];
        $batchSize = 500;
        $processedCount = 0;

        DB::beginTransaction();

        try {
            foreach ($reader->getSheetIterator() as $sheet) {
                foreach ($sheet->getRowIterator() as $rowIndex => $row) {
                    $cells = $row->toArray();

                    // First row = headers
                    if ($rowIndex === 1) {
                        $headers = array_map('trim', $cells);
                        continue;
                    }

                    // Skip empty rows
                    if (empty(array_filter($cells))) {
                        continue;
                    }

                    $record = array_combine($headers, $cells);

                    if (empty($record['title'])) {
                        $this->command->warn("Skipping rules row {$rowIndex}: Missing title");
                        continue;
                    }

                    $oldId = trim($record['id']) !== '' ? (int) $record['id'] : null;
                    $uuid = $oldId ? (string) Str::uuid() : null;

                    $oldModelId = trim($record['model_id']) !== '' ? (int) $record['model_id'] : null;
                    $modelUuid = null;
                    
                    if ($oldModelId) {
                        $metric = DB::table('metrics')->where('old_id', $oldModelId)->first();
                        $modelUuid = $metric ? $metric->id : (string) Str::uuid();
                    }

                    $batchData[] = [
                        'id' => $uuid,
                        'old_id' => $oldId,
                        'title' => trim($record['title']),
                        'subject' => $record['subject'] ?? null,
                        'operator' => $record['operator'] ?? null,
                        'predicate' => $record['predicate'] ?? null,
                        'logical_operator' => $record['logical_operator'] ?? null,
                        'model_id' => $modelUuid,
                        'old_model_id' => $oldModelId,
                        'model_type' => $record['model_type'] ?? null,
                        'created_at' => trim($record['created_at']) !== '' ? $record['created_at'] : now(),
                        'updated_at' => trim($record['updated_at']) !== '' ? $record['updated_at'] : now(),
                        'deleted_at' => trim($record['deleted_at']) !== '' ? $record['deleted_at'] : null,
                    ];

                    if (count($batchData) >= $batchSize) {
                        DB::table('rules')->insertOrIgnore($batchData);
                        $processedCount += count($batchData);
                        $batchData = [];
                        $this->command->info("Processed {$processedCount} rules from CSV...");
                    }
                }
            }

            if (!empty($batchData)) {
                DB::table('rules')->insertOrIgnore($batchData);
                $processedCount += count($batchData);
            }

            DB::commit();
            $this->command->info("Successfully imported {$processedCount} rules from CSV");
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception("Rules import failed: " . $e->getMessage());
        } finally {
            $reader->close();
        }
    }
}