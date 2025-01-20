<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\IdeascaleProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MonthlyReport>
 */
class MonthlyReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(array: ['published', 'draft']),
            'ideascale_profile_id' => IdeascaleProfile::factory(),
        ];
    }
}
