<?php

declare(strict_types=1);

namespace Tests\Unit\Models;

use App\Enums\BookmarkVisibility;
use App\Models\BookmarkCollection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookmarkCollectionVisibilityTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_only_returns_public_collections_by_default_due_to_global_scope()
    {
        $user = User::factory()->create();

        $publicCollection = BookmarkCollection::factory()->create([
            'user_id' => $user->id,
            'title' => 'Public Collection',
            'visibility' => BookmarkVisibility::PUBLIC()->value,
        ]);

        $unlistedCollection = BookmarkCollection::factory()->create([
            'user_id' => $user->id,
            'title' => 'Unlisted Collection',
            'visibility' => BookmarkVisibility::UNLISTED()->value,
        ]);

        $privateCollection = BookmarkCollection::factory()->create([
            'user_id' => $user->id,
            'title' => 'Private Collection',
            'visibility' => BookmarkVisibility::PRIVATE()->value,
        ]);

        $defaultCollections = BookmarkCollection::all();

        $this->assertCount(1, $defaultCollections);
        $this->assertEquals($publicCollection->id, $defaultCollections->first()->id);
        $this->assertEquals('Public Collection', $defaultCollections->first()->title);

        $publicCollections = BookmarkCollection::publicVisibility()->get();

        $this->assertCount(1, $publicCollections);
        $this->assertEquals($publicCollection->id, $publicCollections->first()->id);
        $this->assertEquals('Public Collection', $publicCollections->first()->title);
    }

    /** @test */
    public function it_can_filter_collections_by_specific_visibility()
    {
        $user = User::factory()->create();

        BookmarkCollection::factory()->create([
            'user_id' => $user->id,
            'visibility' => BookmarkVisibility::PUBLIC()->value,
        ]);

        $unlistedCollection = BookmarkCollection::factory()->create([
            'user_id' => $user->id,
            'title' => 'Unlisted Collection',
            'visibility' => BookmarkVisibility::UNLISTED()->value,
        ]);

        BookmarkCollection::factory()->create([
            'user_id' => $user->id,
            'visibility' => BookmarkVisibility::PRIVATE()->value,
        ]);

        $unlistedCollections = BookmarkCollection::visibility(BookmarkVisibility::UNLISTED()->value)->get();

        $this->assertCount(1, $unlistedCollections);
        $this->assertEquals($unlistedCollection->id, $unlistedCollections->first()->id);
        $this->assertEquals('Unlisted Collection', $unlistedCollections->first()->title);
    }

    /** @test */
    public function it_can_combine_visibility_scope_with_other_scopes()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $publicCollection1 = BookmarkCollection::factory()->create([
            'user_id' => $user1->id,
            'title' => 'User 1 Public Collection',
            'visibility' => BookmarkVisibility::PUBLIC()->value,
        ]);

        BookmarkCollection::factory()->create([
            'user_id' => $user2->id,
            'title' => 'User 2 Public Collection',
            'visibility' => BookmarkVisibility::PUBLIC()->value,
        ]);

        BookmarkCollection::factory()->create([
            'user_id' => $user1->id,
            'title' => 'User 1 Private Collection',
            'visibility' => BookmarkVisibility::PRIVATE()->value,
        ]);

        $user1PublicCollections = BookmarkCollection::publicVisibility()
            ->where('user_id', $user1->id)
            ->get();

        $this->assertCount(1, $user1PublicCollections);
        $this->assertEquals($publicCollection1->id, $user1PublicCollections->first()->id);
        $this->assertEquals('User 1 Public Collection', $user1PublicCollections->first()->title);
    }

    /** @test */
    public function it_can_bypass_global_scope_with_all_visibilities_scope()
    {
        $user = User::factory()->create();

        BookmarkCollection::factory()->create([
            'user_id' => $user->id,
            'title' => 'Public Collection',
            'visibility' => BookmarkVisibility::PUBLIC()->value,
        ]);

        BookmarkCollection::factory()->create([
            'user_id' => $user->id,
            'title' => 'Unlisted Collection',
            'visibility' => BookmarkVisibility::UNLISTED()->value,
        ]);

        BookmarkCollection::factory()->create([
            'user_id' => $user->id,
            'title' => 'Private Collection',
            'visibility' => BookmarkVisibility::PRIVATE()->value,
        ]);

        $allCollections = BookmarkCollection::allVisibilities()->get();
        $this->assertCount(3, $allCollections);

        $defaultCollections = BookmarkCollection::all();
        $this->assertCount(1, $defaultCollections);
    }

    /** @test */
    public function it_can_filter_by_specific_visibility_without_global_scope()
    {
        $user = User::factory()->create();

        BookmarkCollection::factory()->create([
            'user_id' => $user->id,
            'visibility' => BookmarkVisibility::PUBLIC()->value,
        ]);

        $unlistedCollection = BookmarkCollection::factory()->create([
            'user_id' => $user->id,
            'title' => 'Unlisted Collection',
            'visibility' => BookmarkVisibility::UNLISTED()->value,
        ]);

        $privateCollection = BookmarkCollection::factory()->create([
            'user_id' => $user->id,
            'title' => 'Private Collection',
            'visibility' => BookmarkVisibility::PRIVATE()->value,
        ]);

        $privateCollections = BookmarkCollection::privateVisibility()->get();
        $this->assertCount(1, $privateCollections);
        $this->assertEquals($privateCollection->id, $privateCollections->first()->id);

        $unlistedCollections = BookmarkCollection::unlistedVisibility()->get();
        $this->assertCount(1, $unlistedCollections);
        $this->assertEquals($unlistedCollection->id, $unlistedCollections->first()->id);
    }
}
