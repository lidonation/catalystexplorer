<?php

namespace Database\Factories;

use App\Models\Fund;
use App\Models\Proposal;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\ProjectSchedule>
 */
class ProjectScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $budget = $this->faker->randomFloat(2, 10000, 100000);
        $status = $this->faker->randomElement(['null', 'paused', 'completed']);
        
        return [
            'title' => $this->faker->sentence(4),
            'url' => $this->faker->url(),
            'project_id' => $this->faker->randomNumber(4),
            'budget' => $budget,
            'milestone_count' => $this->faker->numberBetween(3, 8),
            'funds_distributed' => $status === 'completed' 
                ? $budget 
                : $this->faker->randomFloat(2, 0, $budget * 0.8),
            'starting_date' => $this->faker->dateTimeBetween('now', '+60 days'),
            'currency' => $this->faker->randomElement(['usd', 'ada']),
            'status' => $status,
            'created_at' => now()->subDays($this->faker->numberBetween(0, 365)),
            
            'proposal_id' => function() {
                return Proposal::inRandomOrder()->value('id');
            },
            'fund_id' => function() {
                return Fund::inRandomOrder()->value('id');
            },
        ];
    }
}