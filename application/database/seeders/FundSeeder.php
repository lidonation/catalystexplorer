<?php declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Fund;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class FundSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $date = Carbon::make(now());
        Fund::factory()
            ->count(5)
            ->recycle(User::factory()->create())
            ->sequence(fn (Sequence $sequence) => [
                'launched_at' => $date->subMonths($sequence->count + 1),
            ])
            ->create();
    }
}
