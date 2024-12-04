<?php declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Meta;
use App\Models\Campaign;
use App\Models\Community;
use App\Models\Group;
use App\Models\Proposal;
use Illuminate\Database\Seeder;
use App\Models\IdeascaleProfile;
use App\Models\Tag;

class ProposalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Proposal::factory()->count(500)
            ->recycle(Campaign::factory()->create())
            ->has(IdeascaleProfile::factory(fake()->numberBetween(3, 10)), 'users')
            ->has(Meta::factory()->state(fn() => [
                "key" => fake()->randomElement(['woman_proposal', 'impact_proposal', 'ideafest_proposal']),
                "content" => fake()->randomElement([0, 1]),
                "model_type" => Proposal::class,
            ]))
            ->hasAttached(Group::factory(), [])
            ->hasAttached(Tag::factory(), ['model_type' => Proposal::class])
            ->hasAttached(Community::factory(), [])
            ->create();
    }
}
