<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Jobs\AttachImageJob;
use Illuminate\Database\Seeder;
use App\Models\IdeascaleProfile;
use App\Jobs\AttachProfileImageJob;
use Database\Seeders\Traits\GetImageLink;

class IdeascaleProfilesSeeder extends Seeder
{
    use GetImageLink;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        collect(range(1, 100))
            ->chunk(100)
            ->each(function ($chunk) {
                $profiles = IdeascaleProfile::factory(count($chunk))->create();

                foreach ($profiles as $profile) {
                    AttachImageJob::dispatch($profile, collectionName: 'profile');
                }
            });
    }
}