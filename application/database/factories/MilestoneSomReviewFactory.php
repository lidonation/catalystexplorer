<?php

namespace Database\Factories;

use App\Enums\MilestoneRoleEnum;
use App\Models\Milestone;
use App\Models\Proposal;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MilestoneSomReview>
 */
class MilestoneSomReviewFactory extends Factory
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
            'milestone_id' => Milestone::factory(),
            'proposal_id' => Proposal::factory(),
            'outputs_approves' => $this->faker->boolean,
            'outputs_comment' => $this->faker->optional()->sentence,
            'success_criteria_approves' => $this->faker->boolean,
            'success_criteria_comment' => $this->faker->optional()->sentence,
            'evidence_approves' => $this->faker->boolean,
            'evidence_comment' => $this->faker->sentence,
            'current' => $this->faker->boolean,
            'role' => $this->faker->randomElement([MilestoneRoleEnum::from(0)->role(), MilestoneRoleEnum::from(1)->role(), MilestoneRoleEnum::from(2)->role(), MilestoneRoleEnum::from(3)->role(), MilestoneRoleEnum::from(4)->role()]),
            'user_id' => (string) $this->faker->randomNumber(5, true),
            'created_at' => Carbon::now()->subDays($this->faker->numberBetween(0, 3 * 365)),
        ];
    }
}
