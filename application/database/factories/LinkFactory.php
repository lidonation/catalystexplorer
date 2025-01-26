<?php

namespace Database\Factories;

use App\Enums\StatusEnum;
use App\Models\Link;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Link>
 */
class LinkFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Link::class;

    public function definition(): array
    {
        return [
            'link' => $this->faker->url(),
            'status' => $this->faker->randomElement(StatusEnum::cases()),
            'type' => $this->faker->word(),
            'label' => $this->faker->sentence(3),
            'title' => $this->faker->sentence(5),
            'order' => $this->faker->randomDigitNotNull(),
            'valid' => $this->faker->boolean(),
        ];
    }
}
