<?php declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Fund;
use App\Models\User;
use Illuminate\Database\Seeder;

class FundSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Fund::factory()
            ->count(5)
            ->recycle(User::factory()->create())
            ->create();
    }
}
