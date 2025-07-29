<?php

namespace Database\Factories;

use App\Models\MilestonePoa;
use App\Models\Proposal;
use Carbon\Carbon;
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
            'id' => $this->faker->unique()->randomNumber(5, true),
            'milestone_poas_id' => MilestonePoa::factory(),
            'proposal_id' => Proposal::factory(),
            'created_at' => Carbon::now()->subDays($this->faker->numberBetween(0, 3 * 365)),
            'user_id' => (string) $this->faker->randomNumber(5, true),
        ];
    }
}
