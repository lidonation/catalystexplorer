<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Fund;
use App\Models\User;
use App\Models\Campaign;
use App\Jobs\AttachImageJob;
use Illuminate\Database\Seeder;
use Database\Seeders\Traits\GetImageLink;

class CampaignSeeder extends Seeder
{
    use GetImageLink;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $funds = Fund::all();

        $campaigns = $funds->flatMap(
            fn($fund) => Campaign::factory()->count(5)->for($fund, 'fund')->create()
        );

        $campaigns->each(function (Campaign $campaign) {
            AttachImageJob::dispatch($campaign,  'hero');

            AttachImageJob::dispatch($campaign,  'banner');
        });
    }
}
