<?php

declare(strict_types=1);

use App\DataTransferObjects\BookmarkItemData;
use App\Models\BookmarkItem;
use App\Models\BookmarkCollection;
use App\Models\Group;
use App\Enums\VoteEnum;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class);

it('converts BookmarkItem model to BookmarkItemData DTO successfully', function () {
    $bookmarkItem = BookmarkItem::factory()->create();

    $dto = $bookmarkItem->toDto();

    expect($dto)->toBeInstanceOf(BookmarkItemData::class)
        ->and($dto->id)->toBe((string) $bookmarkItem->id) // BookmarkItem uses int ID
        ->and($dto->user_id)->toBe($bookmarkItem->user_id)
        ->and($dto->bookmark_collection_id)->toBe($bookmarkItem->bookmark_collection_id)
        ->and($dto->model_id)->toBe($bookmarkItem->model_id)
        ->and($dto->model_type)->toBe($bookmarkItem->model_type)
        ->and($dto->title)->toBe($bookmarkItem->title)
        ->and($dto->content)->toBe($bookmarkItem->content)
        ->and($dto->action)->toBe($bookmarkItem->action)
        ->and($dto->vote)->toBe($bookmarkItem->vote);
});

it('serializes BookmarkItemData to array correctly', function () {
    $bookmarkItem = BookmarkItem::factory()->create();
    $dto = $bookmarkItem->toDto();
    $array = $dto->toArray();

    expect($array)->toBeArray()
        ->toHaveKey('id')
        ->toHaveKey('user_id', $bookmarkItem->user_id)
        ->toHaveKey('model_id', $bookmarkItem->model_id)
        ->toHaveKey('model_type', $bookmarkItem->model_type)
        ->toHaveKey('title', $bookmarkItem->title)
        ->toHaveKey('content', $bookmarkItem->content)
        ->toHaveKey('action', $bookmarkItem->action)
        ->toHaveKey('vote')
        ->toHaveKey('created_at')
        ->toHaveKey('updated_at')
        ->toHaveKey('model');
});

it('handles polymorphic model relationship in BookmarkItemData', function () {
    $bookmarkItem = BookmarkItem::factory()->create();
    $bookmarkItem->load('model'); // Load the polymorphic relationship
    $dto = $bookmarkItem->toDto();

    // The model should be one of the supported DTO types
    expect($dto->model)->toSatisfy(function ($model) {
        return $model instanceof \App\DataTransferObjects\ProposalData ||
               $model instanceof \App\DataTransferObjects\ReviewData ||
               $model instanceof \App\DataTransferObjects\IdeascaleProfileData ||
               $model instanceof \App\DataTransferObjects\CommunityData ||
               $model instanceof \App\DataTransferObjects\GroupData;
    });
});

it('handles VoteEnum in BookmarkItemData', function () {
    $yesVoteItem = BookmarkItem::factory()->create(['vote' => VoteEnum::YES]);
    $noVoteItem = BookmarkItem::factory()->create(['vote' => VoteEnum::NO]);
    $nullVoteItem = BookmarkItem::factory()->create(['vote' => null]);

    $yesDfo = $yesVoteItem->toDto();
    $noDto = $noVoteItem->toDto();
    $nullDto = $nullVoteItem->toDto();

    expect($yesDfo->vote)->toBe(VoteEnum::YES)
        ->and($noDto->vote)->toBe(VoteEnum::NO)
        ->and($nullDto->vote)->toBeNull();
});

it('creates BookmarkItemData from array data', function () {
    $groupData = [
        'id' => fake()->uuid(),
        'name' => 'Test Group',
        'user_id' => null,
        'bio' => null,
        'banner_img_url' => null,
        'slug' => 'test-group',
        'status' => 'active',
        'meta_title' => null,
        'website' => null,
        'twitter' => null,
        'discord' => null,
        'github' => null,
        'linkedin' => null,
        'created_at' => now()->format('Y-m-d H:i:s'),
        'updated_at' => now()->format('Y-m-d H:i:s'),
        'deleted_at' => null,
        'amount_awarded_ada' => 0.0,
        'amount_awarded_usd' => 0.0,
        'amount_requested_ada' => 0.0,
        'amount_requested_usd' => 0.0,
        'amount_distributed_ada' => 0.0,
        'amount_distributed_usd' => 0.0,
        'proposals_count' => 0,
        'completed_proposals_count' => 0,
        'funded_proposals_count' => 0,
        'unfunded_proposals_count' => 0,
        'proposals_funded' => 0,
        'proposals_unfunded' => 0,
        'proposals_completed' => 0,
        'ideascale_profiles' => null,
        'reviews_count' => 0,
    ];

    $data = [
        'id' => '1',
        'user_id' => fake()->uuid(),
        'bookmark_collection_id' => fake()->uuid(),
        'model_id' => fake()->uuid(),
        'model' => $groupData,
        'model_type' => Group::class,
        'title' => 'Test Bookmark Item',
        'content' => 'Test content',
        'action' => 5,
        'vote' => VoteEnum::YES,
        'created_at' => now()->format('Y-m-d H:i:s'),
        'updated_at' => now()->format('Y-m-d H:i:s'),
        'deleted_at' => null,
    ];

    $dto = BookmarkItemData::from($data);

    expect($dto)->toBeInstanceOf(BookmarkItemData::class)
        ->and($dto->id)->toBe('1')
        ->and($dto->title)->toBe('Test Bookmark Item')
        ->and($dto->content)->toBe('Test content')
        ->and($dto->action)->toBe(5)
        ->and($dto->vote)->toBe(VoteEnum::YES)
        ->and($dto->model)->toBeInstanceOf(\App\DataTransferObjects\GroupData::class)
        ->and($dto->model->name)->toBe('Test Group');
});

it('handles BookmarkItem with collection relationship', function () {
    $collection = BookmarkCollection::factory()->create();
    $bookmarkItem = BookmarkItem::factory()->create([
        'bookmark_collection_id' => $collection->id
    ]);

    $dto = $bookmarkItem->toDto();

    expect($dto->bookmark_collection_id)->toBe($collection->id);
});

it('handles BookmarkItem without collection relationship', function () {
    $bookmarkItem = BookmarkItem::factory()->create([
        'bookmark_collection_id' => null
    ]);

    $dto = $bookmarkItem->toDto();

    expect($dto->bookmark_collection_id)->toBeNull();
});

it('handles different action values in BookmarkItemData', function () {
    $item1 = BookmarkItem::factory()->create(['action' => 1]);
    $item5 = BookmarkItem::factory()->create(['action' => 5]);
    $item10 = BookmarkItem::factory()->create(['action' => 10]);
    $itemNull = BookmarkItem::factory()->create(['action' => null]);

    expect($item1->toDto()->action)->toBe(1)
        ->and($item5->toDto()->action)->toBe(5)
        ->and($item10->toDto()->action)->toBe(10)
        ->and($itemNull->toDto()->action)->toBeNull();
});

it('preserves all VoteEnum values correctly', function () {
    foreach (VoteEnum::cases() as $voteCase) {
        $item = BookmarkItem::factory()->create(['vote' => $voteCase]);
        $dto = $item->toDto();
        
        expect($dto->vote)->toBe($voteCase);
    }
});

// Type Validation Tests
it('validates all BookmarkItemData field types', function () {
    $item = BookmarkItem::factory()->create();
    $dto = $item->toDto();
    
    // Nullable string fields
    expect($dto->id)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->user_id)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->bookmark_collection_id)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->model_id)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->model_type)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->title)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->content)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->created_at)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->updated_at)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->deleted_at)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    
    // Nullable integer field
    expect($dto->action)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    
    // VoteEnum field (nullable)
    expect($dto->vote)->toSatisfy(fn($v) => is_null($v) || $v instanceof VoteEnum);
    
    // Union type model field
    expect($dto->model)->toSatisfy(fn($v) => 
        $v instanceof \App\DataTransferObjects\ProposalData ||
        $v instanceof \App\DataTransferObjects\ReviewData ||
        $v instanceof \App\DataTransferObjects\IdeascaleProfileData ||
        $v instanceof \App\DataTransferObjects\CommunityData ||
        $v instanceof \App\DataTransferObjects\GroupData
    );
});

it('rejects invalid BookmarkItemData types', function () {
    expect(fn() => BookmarkItemData::from([
        'id' => 123 // should be string or null
    ]))->toThrow();
    
    expect(fn() => BookmarkItemData::from([
        'id' => 'valid-id',
        'action' => 'not-integer' // should be int or null
    ]))->toThrow();
});

it('accepts null values for BookmarkItemData nullable fields', function () {
    $validModel = \App\DataTransferObjects\GroupData::from([
        'id' => 'test-id'
    ]);
    
    $dto = BookmarkItemData::from([
        'id' => null,
        'user_id' => null,
        'bookmark_collection_id' => null,
        'model_id' => null,
        'model' => $validModel, // This field is required (not nullable)
        'model_type' => null,
        'title' => null,
        'content' => null,
        'action' => null,
        'vote' => null,
        'created_at' => null,
        'updated_at' => null,
        'deleted_at' => null
    ]);
    
    expect($dto->id)->toBeNull();
    expect($dto->user_id)->toBeNull();
    expect($dto->action)->toBeNull();
    expect($dto->vote)->toBeNull();
    expect($dto->model)->toBeInstanceOf(\App\DataTransferObjects\GroupData::class);
});
