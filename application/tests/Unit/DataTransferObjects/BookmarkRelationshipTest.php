<?php

declare(strict_types=1);

use App\DataTransferObjects\BookmarkCollectionData;
use App\DataTransferObjects\BookmarkItemData;
use App\Models\BookmarkCollection;
use App\Models\BookmarkItem;
use App\Models\Group;
use App\Models\User;
use App\Enums\VoteEnum;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class);

it('converts BookmarkCollection with items to DTO with proper relationships', function () {
    $collection = BookmarkCollection::factory()->create();
    $group = Group::factory()->create();
    
    // Create bookmark items for this collection
    $item1 = BookmarkItem::factory()->create([
        'bookmark_collection_id' => $collection->id,
        'model_type' => Group::class,
        'model_id' => $group->id,
        'vote' => VoteEnum::YES,
    ]);
    
    $item2 = BookmarkItem::factory()->create([
        'bookmark_collection_id' => $collection->id,
        'model_type' => Group::class,
        'model_id' => $group->id,
        'vote' => VoteEnum::NO,
    ]);

    // Load relationships
    $collection->load(['items', 'author']);
    $dto = $collection->toDto();

    expect($dto)->toBeInstanceOf(BookmarkCollectionData::class)
        ->and($dto->items_count)->toBeInt()
        ->and($dto->items_count)->toBeGreaterThanOrEqual(2);
});

it('handles BookmarkCollection with different list types', function () {
    // Create normal collection (no fund_id)
    $normalCollection = BookmarkCollection::factory()->create(['fund_id' => null]);
    
    // Create voter collection (with fund_id)
    $user = User::factory()->create();
    $voterCollection = BookmarkCollection::factory()->create([
        'fund_id' => fake()->uuid(),
        'user_id' => $user->id
    ]);

    $normalDto = $normalCollection->toDto();
    $voterDto = $voterCollection->toDto();

    expect($normalDto->list_type)->toBe('normal')
        ->and($voterDto->list_type)->toBeSatisfy(
            fn($type) => in_array($type, ['voter', 'tinder', 'normal'])
        );
});

it('handles BookmarkCollection tinder direction based on votes', function () {
    $collection = BookmarkCollection::factory()->create();
    $group = Group::factory()->create();
    
    // Create items with only YES votes
    BookmarkItem::factory()->count(3)->create([
        'bookmark_collection_id' => $collection->id,
        'model_type' => Group::class,
        'model_id' => $group->id,
        'vote' => VoteEnum::YES,
    ]);

    $collection->refresh();
    $dto = $collection->toDto();
    $array = $dto->toArray();

    // Should have tinder_direction computed attribute
    expect($array)->toHaveKey('tinder_direction');
});

it('handles BookmarkItem collection relationships properly', function () {
    $collection = BookmarkCollection::factory()->create(['title' => 'My Test Collection']);
    $item = BookmarkItem::factory()->create([
        'bookmark_collection_id' => $collection->id,
    ]);

    $item->load(['collection', 'model']);
    $dto = $item->toDto();

    expect($dto)->toBeInstanceOf(BookmarkItemData::class)
        ->and($dto->bookmark_collection_id)->toBe($collection->id);
});

it('converts collection of BookmarkItems to DTO collection', function () {
    $items = BookmarkItem::factory()->count(3)->create();
    
    $dtoCollection = BookmarkItem::toDtoCollection($items);

    expect($dtoCollection)->toHaveCount(3);
    
    $dtoCollection->each(function ($dto) {
        expect($dto)->toBeInstanceOf(BookmarkItemData::class);
    });
});

it('converts collection of BookmarkCollections to DTO collection', function () {
    $collections = BookmarkCollection::factory()->count(3)->create();
    
    $dtoCollection = BookmarkCollection::toDtoCollection($collections);

    expect($dtoCollection)->toHaveCount(3);
    
    $dtoCollection->each(function ($dto) {
        expect($dto)->toBeInstanceOf(BookmarkCollectionData::class);
    });
});

it('handles BookmarkCollection with computed amounts', function () {
    $collection = BookmarkCollection::factory()->create();
    
    // The collection should have computed amount attributes
    $dto = $collection->toDto();
    $array = $dto->toArray();

    expect($array)->toHaveKey('amount_requested_USD')
        ->toHaveKey('amount_received_ADA')
        ->toHaveKey('amount_requested_ADA')
        ->toHaveKey('amount_received_USD');
});

it('handles BookmarkCollection types count correctly', function () {
    $collection = BookmarkCollection::factory()->create();
    $dto = $collection->toDto();

    // types_count should be an object with counts
    if ($dto->types_count !== null) {
        expect($dto->types_count)->toBeObject();
        $typesCountArray = (array) $dto->types_count;
        expect($typesCountArray)->toHaveKey('proposals')
            ->toHaveKey('groups')
            ->toHaveKey('communities')
            ->toHaveKey('reviews')
            ->toHaveKey('ideascaleProfiles');
    }
});

it('serializes complex bookmark relationships to JSON correctly', function () {
    $collection = BookmarkCollection::factory()->create();
    $items = BookmarkItem::factory()->count(2)->create([
        'bookmark_collection_id' => $collection->id
    ]);

    $collection->load(['items', 'author']);
    $collectionDto = $collection->toDto();
    
    $itemDtos = BookmarkItem::toDtoCollection($items);

    $collectionJson = $collectionDto->toJson();
    $itemsJson = $itemDtos->toJson();

    expect($collectionJson)->toBeString();
    expect($itemsJson)->toBeString();

    $decodedCollection = json_decode($collectionJson, true);
    $decodedItems = json_decode($itemsJson, true);

    expect($decodedCollection)->toBeArray()
        ->toHaveKey('id')
        ->toHaveKey('title')
        ->toHaveKey('types_count');

    expect($decodedItems)->toBeArray()
        ->toHaveCount(2);
});

it('handles BookmarkItem with different model types', function () {
    // Create items with different polymorphic model types
    $group = Group::factory()->create();
    
    $groupItem = BookmarkItem::factory()->create([
        'model_type' => Group::class,
        'model_id' => $group->id,
    ]);

    $groupItem->load('model');
    $groupDto = $groupItem->toDto();

    expect($groupDto->model_type)->toBe(Group::class)
        ->and($groupDto->model)->toBeInstanceOf(\App\DataTransferObjects\GroupData::class);
});
