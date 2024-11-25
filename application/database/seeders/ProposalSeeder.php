<?php declare(strict_types=1);

namespace Database\Seeders;

use Database\Seeders\Traits\UseFaker;
use App\Models\Campaign;
use App\Models\Proposal;
use Illuminate\Database\Seeder;
use App\Models\IdeascaleProfile;

class ProposalSeeder extends Seeder
{
    use UseFaker;
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Proposal::factory()->count(100)
            ->recycle(Campaign::factory()->create())
            ->has(IdeascaleProfile::factory($this->withFaker()->numberBetween(3,10)),'users')
            ->create();
    }
}
