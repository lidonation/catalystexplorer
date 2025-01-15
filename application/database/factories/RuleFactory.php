<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\LogicalOperators;
use App\Enums\Operators;
use App\Models\Metric;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Rule>
 */
class RuleFactory extends Factory
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
            'subject' => $this->faker->randomElement(['id', 'amount_requested', 'status']),
            'operator' => $this->faker->randomElement(Operators::toValues()),
            'predicate' => $this->faker->word,
            'logical_operator' => $this->faker->randomElement(LogicalOperators::toValues()),
            'model_id' => Metric::factory(),
            'model_type' => Metric::class,
        ];
    }

    public function homeMetricRule(): Factory
    {
        return $this->state(function () {
            return [
                'model_id' => Metric::factory()->homeMetric()->create()->id,
                'model_type' => Metric::class,
            ];
        });
    }
}
