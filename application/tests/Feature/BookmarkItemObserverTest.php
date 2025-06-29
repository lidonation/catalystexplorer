<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookmarkItemObserverTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_prevents_non_proposal_items_in_funded_collections()
    {
        $user = User::factory()->create();

        $collection = BookmarkCollection::factory()->create([
            'user_id' => $user->id,
            'fund_id' => 9, 
        ]);

        $bookmark = BookmarkItem::create([
            'bookmark_collection_id' => $collection->id,
            'model_type' => \App\Models\Comment::class, 
            'model_id' => 1,
            'user_id' => $user->id,
        ]);

        $this->assertNull($bookmark);
        $this->assertDatabaseMissing('bookmark_items', [
            'bookmark_collection_id' => $collection->id,
            'model_type' => \App\Models\Comment::class,
        ]);
    }

    public function test_it_allows_proposal_items_in_funded_collections()
    {
        $user = User::factory()->create();

        $collection = BookmarkCollection::factory()->create([
            'user_id' => $user->id,
            'fund_id' => 9, // Funded
        ]);

        $proposal = Proposal::factory()->create();

        $bookmark = BookmarkItem::create([
            'bookmark_collection_id' => $collection->id,
            'model_type' => Proposal::class,
            'model_id' => $proposal->id,
            'user_id' => $user->id,
        ]);

        $this->assertNotNull($bookmark);
        $this->assertDatabaseHas('bookmark_items', [
            'bookmark_collection_id' => $collection->id,
            'model_type' => Proposal::class,
        ]);
    }

    public function test_it_allows_any_item_in_unfunded_collections()
    {
        $user = User::factory()->create();

        $collection = BookmarkCollection::factory()->create([
            'user_id' => $user->id,
            'fund_id' => null, 
        ]);

        $bookmark = BookmarkItem::create([
            'bookmark_collection_id' => $collection->id,
            'model_type' => \App\Models\Comment::class,
            'model_id' => 123,
            'user_id' => $user->id,
        ]);

        $this->assertNotNull($bookmark);
        $this->assertDatabaseHas('bookmark_items', [
            'bookmark_collection_id' => $collection->id,
            'model_type' => \App\Models\Comment::class,
        ]);
    }
}
