<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Support\Str;
use App\Models\Announcement;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnnouncementFactory extends Factory
{
    protected $model = Announcement::class;

    public function definition()
    {
        return [
            'title' => $this->faker->sentence,
            'content' => $this->faker->paragraph,
            'label' => $this->faker->word,
            'event_starts_at' => $this->faker->dateTimeBetween('now', '+1 week'),
            'event_ends_at' => $this->faker->dateTimeBetween('+1 week', '+2 weeks'),
            'user_id' => User::factory(),
            'cta' => [
                [
                    'link' => $this->faker->url,
                    'label' => $this->faker->word,
                    'title' => $this->faker->sentence,
                ],
            ],
        ];
    }
}