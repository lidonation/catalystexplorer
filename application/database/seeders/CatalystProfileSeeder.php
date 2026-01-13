<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\CatalystProfile;
use App\Jobs\AttachImageJob;
use Illuminate\Database\Seeder;

class CatalystProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        collect(range(1, 100))
            ->chunk(100)
            ->each(function ($chunk) {
                $profiles = CatalystProfile::factory(count($chunk))->create();

                foreach ($profiles as $profile) {
                    AttachImageJob::dispatch($profile, collectionName: 'profile');
                }
            });
    }
}
