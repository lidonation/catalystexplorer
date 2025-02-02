<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CatalystSnapshot;
use Illuminate\Database\Seeder;

class CatalystSnapshotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CatalystSnapshot::create([
            'snapshot_name' => 'Snapshot 1',
            'model_type' => CatalystSnapshot::class,
            'model_id' => 1,
        ]);
    }
}
