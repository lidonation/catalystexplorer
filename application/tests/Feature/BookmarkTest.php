<?php

declare(strict_types=1);

use App\Enums\BookmarkableType;
use App\Models\BookmarkItem;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->anotherUser = User::factory()->create();
});

it('store bookmark successfully', function () {
    $user = User::factory()->create();
    $this->withoutMiddleware();
    $this->actingAs($user);

    $modelType = BookmarkableType::PROPOSALS->value;
    $modelId = 1;
    $response = $this->postJson(route('api.bookmarks.store', [
        'modelType' => $modelType,
        'hash' => $modelId,
    ]));
    $response->assertStatus(200);
});
it('delete bookmark successfully', function () {
    $user = User::factory()->create();
    $proposal = Proposal::factory()->create();
    $bookmarkItem = BookmarkItem::factory()->create([
        'user_id' => $user->id,
        'model_id' => $proposal->id,
        'model_type' => Proposal::class,
    ]);

    $this->withoutMiddleware();
    $this->actingAs($user);

    $response = $this->deleteJson(route('api.bookmarks.remove', [
        'hash' => $bookmarkItem->id,
    ]));

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Bookmark deleted successfully',
        ]);
});

it('check bookmark status successfully', function () {
    $user = User::factory()->create();
    $bookmarkItem = BookmarkItem::factory()->create([
        'user_id' => $user->id,
        'model_id' => 1,
        'model_type' => Proposal::class,
    ]);

    $this->withoutMiddleware();
    $this->actingAs($user);

    $response = $this->getJson(route('api.bookmarks.status', [
        'modelType' => 'proposals',
        'hash' => 1,
    ]));

    $response->assertStatus(200)
        ->assertJson([
            'isBookmarked' => true,
        ]);
});
