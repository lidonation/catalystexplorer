<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Snapshot;
use Illuminate\Database\Seeder;

class SnapshotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Snapshot::create([
            'snapshot_name' => 'Snapshot 1',
            'model_type' => Snapshot::class,
            'model_id' => 1,
        ]);
    }
}
