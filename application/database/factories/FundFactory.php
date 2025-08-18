<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CatalystFunds;
use App\Models\Fund;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class FundFactory extends Factory
{
    protected $model = Fund::class;

    public function definition(): array
    {
        return [
            'user_id' => null,
            'title' => 'Fund '.$this->faker->randomElement(CatalystFunds::toValues()),
            'meta_title' => $this->faker->words(5, true),
            'slug' => $this->faker->unique()->slug(),
            'excerpt' => $this->faker->text(150),
            'comment_prompt' => $this->faker->sentence($this->faker->numberBetween(8, 15)),
            'content' => $this->faker->text($this->faker->numberBetween(150, 250)),
            'amount' => $this->faker->randomFloat(2, 5000000, 100000000),
            'status' => $this->faker->randomElement(['launched', 'retired']),
            'launched_at' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'parent_id' => null,
            'awarded_at' => $this->faker->dateTimeBetween('-1 years', 'now'),
            'color' => $this->faker->hexColor,
            'label' => $this->faker->word,
            'currency' => $this->faker->randomElement(['USD', 'ADA']),
        ];
    }
}