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
        $validPredicates = [
            'id' => [1, 2, 3, 4, 5],
            'amount_requested' => [10, 20, 30, 50, 100],
            'status' => ['pending', 'approved', 'rejected'],
        ];

        $subject = $this->faker->randomElement(array_keys($validPredicates));

        $predicate = $this->faker->randomElement($validPredicates[$subject]);

        return [
            'title' => $this->faker->sentence,
            'subject' => $subject,
            'operator' => $this->faker->randomElement(Operators::toValues()),
            'predicate' => $predicate,
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
