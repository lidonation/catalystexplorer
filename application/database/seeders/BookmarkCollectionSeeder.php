<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use Illuminate\Database\Seeder;

class BookmarkCollectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        BookmarkCollection::factory()
            ->count(10)
            ->create()
            ->each(function (BookmarkCollection $collection) {
                BookmarkItem::factory()
                    ->count(rand(5, 10))
                    ->create([
                        'bookmark_collection_id' => $collection->id,
                        'user_id' => $collection->user_id,
                    ]);
            });
    }
}
