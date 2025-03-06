<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use App\Models\Voter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Drep>
 */
class DrepFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'voter_id' => Voter::factory(),
            'user_id' => User::factory(),
        ];
    }
}
