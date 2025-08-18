<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\BookmarkCollection;
use App\Models\User;
use App\Models\Fund;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BookmarkCollection>
 */
class BookmarkCollectionFactory extends Factory
{
    protected $model = BookmarkCollection::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $user = User::inRandomOrder()->first();
        
        if (!$user) {
            $user = User::factory()->create();
        }

        $fund = Fund::inRandomOrder()->first();

        return [
            'user_id' => $user->id,
            'title' => $this->faker->sentence(3),
            'content' => $this->faker->paragraphs(2, true),
            'color' => $this->faker->safeHexColor(),
            'allow_comments' => $this->faker->boolean(),
            'visibility' => $this->faker->randomElement(['public', 'unlisted', 'private']),
            'status' => $this->faker->randomElement(['draft', 'published']),
            'type' => BookmarkCollection::class,
            'model_type' => $fund ? Fund::class : null,
            'model_id' => $fund?->id,
            'type_type' => null,
            'type_id' => null,
            'fund_id' => $fund?->id,
            'parent_id' => null,
        ];
    }
}