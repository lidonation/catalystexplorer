<?php

namespace Database\Factories;

use App\Models\Milestone;
use App\Models\MilestonePoa;
use App\Models\MilestonePoasReview;
use App\Models\MilestonePoasSignoff;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\MilestonePoa>
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
            'milestone_id' => function() {
                return Milestone::inRandomOrder()->value('id');
            },
            'proposal_id' => null, // bigint - set to null as per schema
            'content' => $this->faker->paragraphs(3, true),
            'current' => $this->faker->boolean(),
            'created_at' => now()->subDays($this->faker->numberBetween(0, 365)),
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (MilestonePoa $poa) {
            MilestonePoasReview::factory()
                ->count($this->faker->numberBetween(1, 3))
                ->create([
                    'milestone_poas_id' => $poa->id,
                    'created_at' => $poa->created_at,
                ]);

            MilestonePoasSignoff::factory()
                ->count($this->faker->numberBetween(1, 2))
                ->create([
                    'milestone_poas_id' => $poa->id,
                    'created_at' => $poa->created_at,
                ]);
        });
    }
}