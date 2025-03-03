<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\User;
use Database\Seeders\Traits\GetImageLink;
use Illuminate\Database\Seeder;

class CampaignSeeder extends Seeder
{
    use GetImageLink;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $campaigns = Campaign::factory()
            ->recycle(User::factory()->create())
            ->count(10)
            ->create();

        $campaigns->each(function (Campaign $campaign) {
            if ($heroImageLink = $this->getRandomImageLink()) {
                $campaign->addMediaFromUrl($heroImageLink)->toMediaCollection('hero');
            }
        });
    }
}
