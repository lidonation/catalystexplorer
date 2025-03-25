<?php

namespace Database\Factories;

use App\Models\Milestone;
use App\Models\ProposalMilestone;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProposalMilestone>
 */
class ProposalMilestoneFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = $this->faker->randomElement(['completed', 'paused']);
        $milestoneAmount =  $this->faker->numberBetween(1000, 10000);
        
        return [
            'id' => $this->faker->unique()->randomNumber(5, true),
            'title' => $this->faker->sentence(4),
            'url' => $this->faker->url,
            'proposal_id' => $this->faker->randomNumber(2),
            'fund_id' => $this->faker->randomNumber(2),
            'project_id' => $this->faker->randomNumber(4),
            'created_at' => Carbon::now()->subDays(rand(0, 3 * 365)),
            'budget' => 4 * $milestoneAmount,
            'milestones_qty' => 4,
            'funds_distributed' => $status == 'completed' ? 4 * $milestoneAmount : 2 * $milestoneAmount,
            'starting_date' => Carbon::now()->addDays(rand(1, 60)),
            'currency' => $this->faker->randomElement(['usd', 'ada']),
            'status' => $status,
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (ProposalMilestone $proposalMilestone) {
            for ($i = 1; $i <= 4; $i++) {
                Milestone::factory()
                    ->create([
                        'proposal_id' => $proposalMilestone->proposal_id,
                        'fund_id' => $proposalMilestone->fund_id,
                        'proposal_milestone_id' => $proposalMilestone->id,
                        'cost' => $proposalMilestone->budget / 4,
                        'milestone' => $i,
                        'created_at' => $proposalMilestone->created_at
                    ]);
            }
        });
    }
}
