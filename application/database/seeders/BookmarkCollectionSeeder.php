<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Group;
use App\Models\Review;
use App\Models\Proposal;
use App\Models\Community;
use Illuminate\Support\Arr;
use App\Models\BookmarkItem;
use Illuminate\Database\Seeder;
use App\Models\IdeascaleProfile;
use App\Models\BookmarkCollection;

class BookmarkCollectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        BookmarkCollection::factory()
            ->count(30)
            ->create()
            ->each(function (BookmarkCollection $collection) {

                $model = Arr::random([
                    Proposal::class,
                    IdeascaleProfile::class,
                    Group::class,
                    Community::class,
                    Review::class
                ]);

                BookmarkItem::factory()
                    ->count(fake()->numberBetween(5, 10))
                    ->create([
                        'bookmark_collection_id' => $collection->id,
                        'user_id' => $collection->user_id,
                        'model_type' => $model,
                        'model_id' => $model::inRandomOrder()->first()?->id ?? Review::factory()->create()->first()->id
                    ]);
            });
    }
}
