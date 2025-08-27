<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Metric;
use App\Models\User;
use Illuminate\Database\Seeder;
use OpenSpout\Reader\CSV\Reader as CSVReader;

class MetricSeeder extends Seeder
{
    public function run(): void
    {

        Metric::factory()
            ->count(6)
            ->recycle(User::factory()->create())
            ->create([
                'context' => fake()->randomElement(['home', 'funds']),
            ]);

        Metric::factory()
            ->count(6)
            ->recycle(User::factory()->create())
            ->homeMetric()
            ->create([
                'context' => fake()->randomElement(['home', 'funds']),
            ]);


        $csvPath = database_path('data/metrics.csv');

        if (!file_exists($csvPath)) {
            $this->command->warn("CSV file not found at {$csvPath}, skipping CSV import");
            return;
        }

        $reader = new CSVReader();
        $reader->open($csvPath);

        $headers = [];
        $processedCount = 0;

        try {
            foreach ($reader->getSheetIterator() as $sheet) {
                foreach ($sheet->getRowIterator() as $rowIndex => $row) {
                    $cells = $row->toArray();

                    if ($rowIndex === 1) {
                        $headers = array_map('trim', $cells);
                        continue;
                    }

                    $cells = array_pad($cells, count($headers), null);
                    $cells = array_slice($cells, 0, count($headers));

                    $record = array_combine($headers, $cells);



                    // $record = array_combine($headers, $cells);

                    if (empty($record['title'])) {
                        $this->command->warn("Skipping row {$rowIndex}: Missing title");
                        continue;
                    }

                    try {
                        Metric::create([
                            'id' => $record['id'],
                            'user_id'  => null,
                            'title'    => trim($record['title']),
                            'content'  => $record['content'] ?? null,
                            'field'    => $record['field'] ?? null,
                            'context'  => $record['context'] ?? null,
                            'color'    => $record['color'] ?? null,
                            'model'    => $record['model'] ?? null,
                            'type'     => $record['type'] ?? null,
                            'query'    => $record['query'] ?? null,
                            'count_by' => $record['count_by'] ?? null,
                            'status'   => $record['status'] ?? null,
                            'order'    => trim($record['order']) !== '' ? (int) $record['order'] : null,
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
