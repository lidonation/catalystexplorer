<?php

namespace Database\Factories;

use App\Enums\MilestoneRoleEnum;
use App\Models\MilestonePoas;
use App\Models\Proposal;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MilestonePoasReview>
 */
class MilestonePoasReviewFactory extends Factory
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
            'milestone_poas_id' => MilestonePoas::factory(),
            'proposal_id' => Proposal::factory(),
            'content_approved' => $this->faker->boolean,
            'content_comment' => $this->faker->sentence,
            'role' => $this->faker->randomElement([MilestoneRoleEnum::from(0)->role(), MilestoneRoleEnum::from(1)->role(), MilestoneRoleEnum::from(2)->role(), MilestoneRoleEnum::from(3)->role(), MilestoneRoleEnum::from(4)->role()]),
            'created_at' => Carbon::now()->subDays($this->faker->numberBetween(0, 3 * 365)),
            'user_id' => (string) $this->faker->randomNumber(5, true),
            'current' => $this->faker->boolean,
        ];
    }
}
