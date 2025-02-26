<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\IdeascaleProfile;
use Database\Seeders\Traits\GetImageLink;
use Illuminate\Database\Seeder;

class IdeascaleProfilesSeeder extends Seeder
{
    use GetImageLink;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $profiles = IdeascaleProfile::factory(10)
            ->create();

        $profiles->each(function (IdeascaleProfile $profile) {
            if ($heroImageLink = $this->getRandomImageLink()) {
                $profile->addMediaFromUrl($heroImageLink)->toMediaCollection('profile');
            }
        });
    }
}
