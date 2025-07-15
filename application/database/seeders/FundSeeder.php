<?php

declare(strict_types=1);

namespace Database\Seeders;

use Carbon\Carbon;
use App\Models\Fund;
use App\Models\User;
use App\Jobs\AttachImageJob;
use Illuminate\Database\Seeder;

class FundSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $startDate = now()->subYears(3);

        $funds = Fund::factory()
            ->count(fake()->numberBetween(10, 15))
            ->recycle(User::factory()->create())
            ->sequence(fn($seq) => [
                'title' => 'Fund ' . $seq->index + 1,
                'created_at' => $startDate->copy()->addMonths(($seq->index + 1) * 3),
                'launched_at' => $startDate->copy()->addMonths(($seq->index + 1) * 3)->addDays(7),
            ])
            ->create();

        $funds->each(function (Fund $fund) {

            AttachImageJob::dispatch($fund,  'hero');

            AttachImageJob::dispatch($fund,  'banner');
        });
    }
}
