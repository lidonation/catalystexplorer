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
                    'block' => $data[4],
                    "epoch" => $data[9],
                    "stake_pub" => $data[11],
                    "stake_key" => $data[10],
                    'json_metadata' => json_decode($data[2]),
                    'raw_metadata' => json_decode($data[3]),
                    'inputs' => json_decode($data[5]),
                    'outputs' => json_decode($data[6]),
                    'type' => $data[7],
                    'created_at' => $data[8],
                ])->create();
            }
            $firstLine = false;
        }
        fclose($csvFile);
    }
}
