<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Fund;
use App\Models\Snapshot;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class SnapshotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fundCount = Fund::count();
        $snapshots = Snapshot::factory(50)->create();
    }
}