<?php

namespace Database\Factories;

use App\Models\Milestone;
use App\Models\MilestonePoas;
use App\Models\MilestonePoasReview;
use App\Models\MilestonePoasSignoff;
use App\Models\Proposal;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MilestonePoas>
 */
class MilestonePoasFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => $this->faker->unique()->randomNumber(5, true),
            'proposal_id' => Proposal::factory(),
            'content' => $this->faker->paragraphs(3, true),
            'milestone_id' => Milestone::factory(),
            'created_at' => Carbon::now()->subDays(rand(0, 3 * 365)),
            'current' => $this->faker->boolean,
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (MilestonePoas $milestonePoas) {
            MilestonePoasReview::factory()
                ->count(2)
                ->create([
                    'milestone_poas_id' => $milestonePoas->id,
                    'proposal_id' => $milestonePoas->proposal_id,
                    'created_at' => $milestonePoas->created_at
                ]);

            MilestonePoasSignoff::factory()
                ->count(2)
                ->create([
                    'milestone_poas_id' => $milestonePoas->id,
                    'proposal_id' => $milestonePoas->proposal_id,
                    'created_at' => $milestonePoas->created_at
                ]);
        });
    }
}
