<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Fund;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\Traits\GetImageLink;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;

class FundSeeder extends Seeder
{
    use GetImageLink;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $date = Carbon::make(now());
        $funds = Fund::factory()
            ->count(fake()->numberBetween(6, 15))
            ->recycle(User::factory()->create())
            ->sequence(fn (Sequence $sequence) => [
                'launched_at' => $date->subMonths($sequence->count + 1),
            ])
            ->create();
        $funds->each(function (Fund $fund) {
            if ($heroImageLink = $this->getRandomImageLink()) {
                $fund->addMediaFromUrl($heroImageLink)->toMediaCollection('hero');
            }

            if ($bannerImageLink = $this->getRandomBannerImageLink()) {
                $fund->addMediaFromUrl($bannerImageLink)->toMediaCollection('banner');
            }
        });
    }
}
