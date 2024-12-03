<?php declare(strict_types=1);

namespace Database\Seeders;

use Database\Seeders\Traits\UseFaker;
use App\Models\Campaign;
use App\Models\Community;
use App\Models\Group;
use App\Models\Proposal;
use Illuminate\Database\Seeder;
use App\Models\IdeascaleProfile;
use App\Models\Tag;

class ProposalSeeder extends Seeder
{
    use UseFaker;
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Proposal::factory()->count(1500)
            ->recycle(Campaign::factory()->create())
            ->has(IdeascaleProfile::factory($this->withFaker()->numberBetween(3,10)),'users')
            ->hasAttached(Group::factory(),[])
            ->hasAttached(Tag::factory(), ['model_type' => Proposal::class]) 
            ->hasAttached(Community::factory(), [])
            ->create();
    }
}
