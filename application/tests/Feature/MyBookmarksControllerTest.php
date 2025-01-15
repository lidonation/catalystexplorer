<?php

use App\Models\User;
use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Proposal;
use App\Models\Group;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Inertia\Testing\AssertableInertia as Assert;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('it retrieves a list of bookmark collections for the authenticated user', function () {
    $user = User::factory()->create();
    BookmarkCollection::factory()->count(3)->create(['user_id' => $user->id]);

    Auth::login($user);

    $response = $this->get(route('my.bookmarks.index'));

    $response->assertStatus(200);

    $response->assertInertia(fn ($page) =>
        $page->component('My/Bookmarks/Index')
             ->has('collections', 3)
    );
}); 

test('it retrieves a single bookmark for the authenticated user', function () {
    $user = User::factory()->create();
    $collection = BookmarkCollection::factory()->create(['user_id' => $user->id]);

    $bookmarkItem = BookmarkItem::factory()->create([
        'bookmark_collection_id' => $collection->id,
        'user_id' => $user->id,
        'model_type' => BookmarkCollection::class,
    ]);

    Auth::login($user);

    $response = $this->get(route('my.bookmarks.show', ['id' => $bookmarkItem->id]));
    $response->assertStatus(200);

    $response->assertInertia(fn ($page) =>
        $page->component('My/Bookmarks/Partials/Show')
             ->where('bookmark.id', $bookmarkItem->id)
             ->where('bookmarkType', 'lists')
    );
});

test('it can create a bookmark item', function () {
    $this->withoutMiddleware();
    $user = User::factory()->create();
    $collection = BookmarkCollection::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)
        ->post(route('my.bookmarks.create-item'), [
            'model_id' => $collection->id,
            'model_type' => 'groups',
            'collection' => [
                'title' => 'Test Collection',
            ],
        ]);

    $response->assertStatus(200);
});

test('it can view a collection', function () {
    $user = User::factory()->create();
    $collection = BookmarkCollection::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('my.bookmarks.collections.view', $collection))
        ->assertStatus(200)
        ->assertSee($collection->title);
});

test('it can get collections of a proposal', function () {
    $user = User::factory()->create();
    $proposal = BookmarkItem::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('my.bookmarks.index', ['model_id' => $proposal->id]))
        ->assertStatus(200)
        ->assertSee($proposal->id);
});

test('it can delete from collection', function () {
    $this->withoutMiddleware();
    $user = User::factory()->create();
    $collection = BookmarkCollection::factory()->create(['user_id' => $user->id]);
    
    $proposal = Proposal::factory()->create();
    
    $bookmarkItem = BookmarkItem::factory()->create([
        'bookmark_collection_id' => $collection->id,
        'user_id' => $user->id,
        'model_id' => $proposal->id,
        'model_type' => 'App\Models\Proposal'
    ]);

    $response = $this->actingAs($user)
        ->delete(route('my.bookmarks.proposals.delete'), [
            'model_id' => $proposal->id,
            'model_type' => 'proposals'
        ]);

    $response->assertStatus(200);
    
    $this->assertSoftDeleted('bookmark_items', [
        'id' => $bookmarkItem->id
    ]);

    $response->assertInertia(fn ($assert) => $assert
        ->component('My/Bookmarks/Partials/Show')
        ->has('message')
        ->where('message', 'Bookmark removed successfully')
    );
});

test('it can delete a collection', function () {
    $this->withoutMiddleware();
    $user = User::factory()->create();
    $collection = BookmarkCollection::factory()->create(['user_id' => $user->id]);
    $items = BookmarkItem::factory(3)->create(['bookmark_collection_id' => $collection->id, 'user_id' => $user->id]);

    $this->actingAs($user)
        ->delete(route('my.bookmarks.collections.destroy'), [
            'bookmark_collection_id' => $collection->id,
            'bookmark_ids' => $items->pluck('id')->toArray(),
        ])
        ->assertStatus(200)
        ->assertSee('Bookmarks deleted successfully');
});
