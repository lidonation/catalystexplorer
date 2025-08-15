<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\MetricCountBy;
use App\Enums\MetricQueryTypes;
use App\Enums\MetricTypes;
use App\Enums\StatusEnum;
use App\Models\Metric;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Metric>
 */
class MetricFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence,
            'user_id' => User::inRandomOrder()->value('id'),
            'content' => $this->faker->sentence(8),
            'color' => $this->faker->hexColor(),
            'model' => $this->faker->randomElement([
                Proposal::class,
            ]),
            'field' => $this->faker->randomElement(['id', 'amount_requested']),
            'type' => $this->faker->randomElement(MetricTypes::cases()),
            'query' => $this->faker->randomElement(MetricQueryTypes::cases()),
            'count_by' => $this->faker->randomElement(MetricCountBy::cases()),
            'status' => $this->faker->randomElement(StatusEnum::cases()),
            'order' => $this->faker->numberBetween(0, 20),
            'created_at' => $this->faker->dateTimeBetween('-2 years', 'now'),
        ];
    }

    /**
     * Indicate that the user is suspended.
     */
    public function homeMetric(): Factory
    {
        return $this->state(function (array $attributes) {
            if ($attributes['model'] !== Proposal::class) {
                return [
                    'context' => null,
                ];
            }

            return [
                'context' => 'home',
                'type' => MetricTypes::TREND(),
                'count_by' => MetricCountBy::FUND(),
                'status' => StatusEnum::published(),
                'query' => MetricQueryTypes::COUNT(),
            ];
        });
    }
}