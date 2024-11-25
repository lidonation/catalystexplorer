<?php declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Campaign;
use App\Models\Fund;
use App\Models\User;
use Database\Factories\FundFactory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CampaignSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Campaign::factory()
            ->recycle(User::factory()->create())
            ->count(10)
            ->create();
    }
}
