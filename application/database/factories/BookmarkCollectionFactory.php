<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CommentsAllowance;
use App\Models\BookmarkCollection;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BookmarkCollection>
 */
class BookmarkCollectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'parent_id' => null,
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraphs(3, true),
            'color' => $this->faker->safeHexColor(),
            'allow_comments' => $this->faker->boolean(),
            'visibility' => $this->faker->randomElement(['public', 'unlisted', 'private']),
            'status' => $this->faker->randomElement(['draft', 'published']),
            'type' => BookmarkCollection::class,
            'type_id' => $this->faker->optional()->randomNumber(5),
            'type_type' => $this->faker->optional()->word(),
        ];
    }
}
