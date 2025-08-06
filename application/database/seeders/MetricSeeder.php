<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Metric;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use OpenSpout\Reader\CSV\Reader as CSVReader;

class MetricSeeder extends Seeder
{
    public function run(): void
    {
        // 1️⃣ Original factory-based seeding
        Metric::factory()
            ->count(6)
            ->recycle(User::factory()->create())
            ->create();

        Metric::factory()
            ->count(6)
            ->recycle(User::factory()->create())
            ->homeMetric()
            ->create();

        // 2️⃣ CSV import
        $csvPath = database_path('data/metrics.csv');

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

                    if ($rowIndex === 1) {
                        $headers = array_map('trim', $cells);
                        continue;
                    }

                    if (empty(array_filter($cells))) {
                        continue;
                    }


                    $record = array_combine($headers, $cells);

                    if (empty($record['title'])) {
                        $this->command->warn("Skipping row {$rowIndex}: Missing title");
                        continue;
                    }

                    $batchData[] = [
                        'id'         => trim($record['id']) !== '' ? (int) $record['id'] : null,
                        'user_id'    => trim($record['user_id']) !== '' ? (int) $record['user_id'] : null,
                        'title'      => trim($record['title']),
                        'content'    => $record['content'] ?? null,
                        'field'      => $record['field'] ?? null,
                        'context'    => $record['context'] ?? null,
                        'color'      => $record['color'] ?? null,
                        'model'      => $record['model'] ?? null,
                        'type'       => $record['type'] ?? null,
                        'query'      => $record['query'] ?? null,
                        'count_by'   => $record['count_by'] ?? null,
                        'status'     => $record['status'] ?? null,
                        'order'      => trim($record['order']) !== '' ? (int) $record['order'] : null,
                        'created_at' => trim($record['created_at']) !== '' ? $record['created_at'] : now(),
                        'updated_at' => trim($record['updated_at']) !== '' ? $record['updated_at'] : now(),
                        'deleted_at' => trim($record['deleted_at']) !== '' ? $record['deleted_at'] : null,
                    ];


                    if (count($batchData) >= $batchSize) {
                        DB::table('metrics')->insertOrIgnore($batchData);
                        $processedCount += count($batchData);
                        $batchData = [];
                        $this->command->info("Processed {$processedCount} metrics from CSV...");
                    }
                }
            }

            if (!empty($batchData)) {
                DB::table('metrics')->insertOrIgnore($batchData);
                $processedCount += count($batchData);
            }

            DB::commit();
            $this->command->info("Successfully imported {$processedCount} metrics from CSV");
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception("Metrics import failed: " . $e->getMessage());
        } finally {
            $reader->close();
        }
    }
}
