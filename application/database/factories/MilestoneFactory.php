<?php

namespace Database\Factories;

use App\Models\Milestone;
use App\Models\MilestonePoa;
use App\Models\MilestoneSomReview;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Milestone>
 */
class MilestoneFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => $this->faker->unique()->randomNumber(5),
            'proposal_id' => $this->faker->randomNumber(2),
            'fund_id' => $this->faker->randomNumber(2),
            'title' => $this->faker->sentence(4),
            'current' => $this->faker->boolean,
            'outputs' => $this->faker->text(200),
            'success_criteria' => $this->faker->text(150),
            'proposal_milestone_id' => $this->faker->randomNumber(2),
            'evidence' => $this->faker->text(250),
            'month' => $this->faker->numberBetween(1, 12),
            'cost' => $this->faker->randomFloat(2, 1000, 50000),
            'completion_percent' => $this->faker->numberBetween(0, 100),
            'milestone' => $this->faker->randomNumber(2),
            'created_at' => Carbon::now(),
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Milestone $milestone) {
            MilestoneSomReview::factory()
                ->count($this->faker->numberBetween(2, 5))
                ->create([
                    'milestone_id' => $milestone->id,
                    'proposal_id' => $milestone->proposal_id,
                    'created_at' => $milestone->created_at
                ]);

            MilestonePoa::factory()
                ->count($this->faker->numberBetween(2, 5))
                ->create([
                    'milestone_id' => $milestone->id,
                    'proposal_id' => $milestone->proposal_id,
                    'created_at' => $milestone->created_at
                ]);
        });
    }
}
