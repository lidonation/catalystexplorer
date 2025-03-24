<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Transaction;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Transaction::truncate();
        $csvFile = fopen(base_path('database/data/transactions.csv'), 'r');
        $firstLine = true;
        while (($data = fgetcsv($csvFile, 8000, ',')) !== false) {
            if (! $firstLine) {
                Transaction::factory([
                    'tx_hash' => $data[1],
                    'block' => $data[3],
                    'json_metadata' => json_decode($data[4]),
                    'raw_metadata' => json_decode($data[5]),
                    'inputs' => json_decode($data[6]),
                    'outputs' => json_decode($data[7]),
                    'type' => $data[8],
                    'created_at' => $data[9],
                    'voters_details' => json_decode($data[10]),
                ])->create();
            }
            $firstLine = false;
        }
        fclose($csvFile);
    }
}
