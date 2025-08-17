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

        if (!file_exists($csvPath)) {
            $this->command->warn("CSV file not found at {$csvPath}, skipping CSV import");
            return;
        }

        $reader = new CSVReader();
        $reader->open($csvPath);

        $headers = [];
        $processedCount = 0;

        // Get available user UUIDs for random assignment
        $userIds = User::pluck('id')->toArray();
        
        if (empty($userIds)) {
            $this->command->warn("No users found for metric assignment");
            return;
        }

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

                    try {
                        Metric::create([
                            'user_id' => !empty($userIds) ? fake()->randomElement($userIds) : null,
                            'title' => trim($record['title']),
                            'content' => $record['content'] ?? null,
                            'field' => $record['field'] ?? null,
                            'context' => $record['context'] ?? null,
                            'color' => $record['color'] ?? null,
                            'model' => $record['model'] ?? null,
                            'type' => $record['type'] ?? null,
                            'query' => $record['query'] ?? null,
                            'count_by' => $record['count_by'] ?? null,
                            'status' => $record['status'] ?? null,
                            'order' => trim($record['order']) !== '' ? (int) $record['order'] : null,
                        ]);

                        $processedCount++;

                        if ($processedCount % 100 === 0) {
                            $this->command->info("Processed {$processedCount} metrics from CSV...");
                        }
                    } catch (\Exception $e) {
                        $this->command->warn("Failed to create metric from row {$rowIndex}: " . $e->getMessage());
                        continue;
                    }
                }
            }

            $this->command->info("Successfully imported {$processedCount} metrics from CSV");
        } catch (\Exception $e) {
            throw new \Exception("Metrics import failed: " . $e->getMessage());
        } finally {
            $reader->close();
        }
    }
}