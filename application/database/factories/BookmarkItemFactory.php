<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BookmarkItem>
 */
class BookmarkItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $bookmarkableModels = [
            Proposal::class,
            IdeascaleProfile::class,
            Group::class,
            Review::class,
            // BookmarkCollection::class,
        ];

        $bookmarkableType = $this->faker->randomElement($bookmarkableModels);

        return [
            'user_id' => User::inRandomOrder()->first()?->id,
            'bookmark_collection_id' => null,
            'model_id' => $bookmarkableType::inRandomOrder()?->first()?->id,
            'model_type' => $bookmarkableType,
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraph(),
            'action' => $this->faker->optional()->numberBetween(1, 10),
        ];
    }
}
