<?php

namespace Database\Factories;

use App\Models\MilestonePoa;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MilestonePoasSignoff>
 */
class MilestonePoasSignoffFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Auto-increment bigint primary key - handled automatically
            'milestone_poas_id' => function() {
                return MilestonePoa::inRandomOrder()->value('id');
            },
            'proposal_id' => null,
            'user_id' => (string) $this->faker->randomNumber(5, true),
            'created_at' => now()->subDays($this->faker->numberBetween(0, 365)),
        ];
    }
}