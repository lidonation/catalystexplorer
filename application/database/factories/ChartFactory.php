<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Announcement;
use App\Models\Metric;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MetricFactory extends Factory
{
    protected $model = Metric::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence,
            'content' => $this->faker->paragraph,
            'label' => $this->faker->word,
            'context' => $this->faker->randomElement(['home', 'proposal', 'special', null]),
            'event_starts_at' => $this->faker->dateTimeBetween('now', '+1 week'),
            'event_ends_at' => $this->faker->dateTimeBetween('+1 week', '+2 weeks'),
            'user_id' => User::factory(),
            'cta' => [
                'link' => $this->faker->url,
                'label' => $this->faker->word,
                'title' => $this->faker->sentence,
            ],
        ];
    }
}
