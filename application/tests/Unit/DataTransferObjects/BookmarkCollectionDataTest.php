<?php

declare(strict_types=1);


use App\DataTransferObjects\BookmarkCollectionData;
use App\Models\BookmarkCollection;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class);

it('converts BookmarkCollection model to BookmarkCollectionData DTO successfully', function () {
    $collection = BookmarkCollection::factory()->create();

    $dto = $collection->toDto();

    expect($dto)->toBeInstanceOf(BookmarkCollectionData::class)
        ->and($dto->id)->toBe($collection->id)
        ->and($dto->user_id)->toBe($collection->user_id)
        ->and($dto->title)->toBe($collection->title)
        ->and($dto->content)->toBe($collection->content)
        ->and($dto->color)->toBe($collection->color)
        ->and($dto->allow_comments)->toBe($collection->allow_comments)
        ->and($dto->visibility)->toBe($collection->visibility)
        ->and($dto->status)->toBe($collection->status)
        ->and($dto->model_type)->toBe($collection->model_type)
        ->and($dto->model_id)->toBe($collection->model_id);
});

it('serializes BookmarkCollectionData to array correctly', function () {
    $collection = BookmarkCollection::factory()->create();
    $dto = $collection->toDto();
    $array = $dto->toArray();

    expect($array)->toBeArray()
        ->toHaveKey('id', $collection->id)
        ->toHaveKey('title', $collection->title)
        ->toHaveKey('content', $collection->content)
        ->toHaveKey('color', $collection->color)
        ->toHaveKey('visibility', $collection->visibility)
        ->toHaveKey('status', $collection->status)
        ->toHaveKey('created_at')
        ->toHaveKey('updated_at')
        ->toHaveKey('types_count')
        ->toHaveKey('list_type');
});

it('handles computed attributes in BookmarkCollectionData', function () {
    $collection = BookmarkCollection::factory()->create();
    $dto = $collection->toDto();

    // Test computed attributes
    expect($dto->types_count)->toSatisfy(
        fn($value) => $value === null || is_object($value)
    )->and($dto->items_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->proposals_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->groups_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->communities_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->reviews_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->list_type)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    );
});

it('handles amount attributes in BookmarkCollectionData', function () {
    $collection = BookmarkCollection::factory()->create();
    $dto = $collection->toDto();

    // Test amount attributes
    expect($dto->amount_requested_USD)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->amount_received_ADA)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->amount_requested_ADA)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->amount_received_USD)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    );
});

it('handles author relationship in BookmarkCollectionData', function () {
    $collection = BookmarkCollection::factory()->create();
    $collection->load('author'); // Load the relationship
    $dto = $collection->toDto();

    expect($dto->author)->toSatisfy(
        fn($value) => $value === null || $value instanceof \App\DataTransferObjects\UserData
    );
});

it('handles fund relationship in BookmarkCollectionData', function () {
    $collection = BookmarkCollection::factory()->create();
    $collection->load('fund'); // Load the relationship if it exists
    $dto = $collection->toDto();

    expect($dto->fund)->toSatisfy(
        fn($value) => $value === null || $value instanceof \App\DataTransferObjects\FundData
    )->and($dto->fund_id)->toBe($collection->fund_id);
});

it('creates BookmarkCollectionData from array data', function () {
    $data = [
        'id' => fake()->uuid(),
        'user_id' => fake()->uuid(),
        'title' => 'Test Collection',
        'content' => 'Test content',
        'color' => '#ff0000',
        'allow_comments' => true,
        'visibility' => 'public',
        'status' => 'published',
        'model_type' => null,
        'model_id' => null,
        'items_count' => 0,
        'type' => 'bookmark_collection',
        'created_at' => now()->format('Y-m-d H:i:s'),
        'updated_at' => now()->format('Y-m-d H:i:s'),
        'deleted_at' => null,
        'types_count' => null,
        'proposals_count' => 0,
        'groups_count' => 0,
        'communities_count' => 0,
        'reviews_count' => 0,
        'comments_count' => 0,
        'amount_requested_USD' => null,
        'amount_received_ADA' => null,
        'amount_requested_ADA' => null,
        'amount_received_USD' => null,
        'author' => null,
        'fund_id' => null,
        'fund' => null,
        'list_type' => null,
    ];

    $dto = BookmarkCollectionData::from($data);

    expect($dto)->toBeInstanceOf(BookmarkCollectionData::class)
        ->and($dto->id)->toBe($data['id'])
        ->and($dto->title)->toBe('Test Collection')
        ->and($dto->content)->toBe('Test content')
        ->and($dto->color)->toBe('#ff0000')
        ->and($dto->allow_comments)->toBeTrue()
        ->and($dto->visibility)->toBe('public')
        ->and($dto->status)->toBe('published');
});

it('handles different visibility levels in BookmarkCollectionData', function () {
    $publicCollection = BookmarkCollection::factory()->create(['visibility' => 'public']);
    $privateCollection = BookmarkCollection::factory()->create(['visibility' => 'private']);
    $unlistedCollection = BookmarkCollection::factory()->create(['visibility' => 'unlisted']);

    $publicDto = $publicCollection->toDto();
    $privateDto = $privateCollection->toDto();
    $unlistedDto = $unlistedCollection->toDto();

    expect($publicDto->visibility)->toBe('public')
        ->and($privateDto->visibility)->toBe('private')
        ->and($unlistedDto->visibility)->toBe('unlisted');
});

it('handles different status values in BookmarkCollectionData', function () {
    $draftCollection = BookmarkCollection::factory()->create(['status' => 'draft']);
    $publishedCollection = BookmarkCollection::factory()->create(['status' => 'published']);

    $draftDto = $draftCollection->toDto();
    $publishedDto = $publishedCollection->toDto();

    expect($draftDto->status)->toBe('draft')
        ->and($publishedDto->status)->toBe('published');
});

// Type Validation Tests
it('validates all BookmarkCollectionData field types from factory', function () {
    $collection = BookmarkCollection::factory()->create();
    $dto = $collection->toDto();
    
    // Nullable string fields
    expect($dto->id)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->user_id)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->title)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->content)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->color)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->visibility)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->status)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->model_type)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->model_id)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->type)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->created_at)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->updated_at)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->deleted_at)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->fund_id)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->list_type)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    
    // Nullable boolean field
    expect($dto->allow_comments)->toSatisfy(fn($v) => is_null($v) || is_bool($v));
    
    // Nullable integer fields
    expect($dto->items_count)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->proposals_count)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->groups_count)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->communities_count)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->reviews_count)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->comments_count)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->amount_requested_USD)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->amount_received_ADA)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->amount_requested_ADA)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->amount_received_USD)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    
    // Object field (types_count)
    expect($dto->types_count)->toSatisfy(fn($v) => is_null($v) || is_object($v));
    
    // Data Transfer Object fields
    expect($dto->author)->toSatisfy(fn($v) => is_null($v) || $v instanceof \App\DataTransferObjects\UserData);
    expect($dto->fund)->toSatisfy(fn($v) => is_null($v) || $v instanceof \App\DataTransferObjects\FundData);
});

it('rejects invalid BookmarkCollectionData types', function () {
    expect(fn() => BookmarkCollectionData::from([
        'id' => 123 // should be string or null
    ]))->toThrow();
    
    expect(fn() => BookmarkCollectionData::from([
        'id' => 'valid-id',
        'allow_comments' => 'not-boolean' // should be bool or null
    ]))->toThrow();
    
    expect(fn() => BookmarkCollectionData::from([
        'id' => 'valid-id',
        'items_count' => 'not-integer' // should be int or null
    ]))->toThrow();
});

it('accepts null values for all BookmarkCollectionData nullable fields', function () {
    $dto = BookmarkCollectionData::from([
        'id' => null,
        'user_id' => null,
        'title' => null,
        'content' => null,
        'color' => null,
        'allow_comments' => null,
        'visibility' => null,
        'status' => null,
        'model_type' => null,
        'model_id' => null,
        'items_count' => null,
        'type' => null,
        'created_at' => null,
        'updated_at' => null,
        'deleted_at' => null,
        'types_count' => null,
        'proposals_count' => null,
        'groups_count' => null,
        'communities_count' => null,
        'reviews_count' => null,
        'comments_count' => null,
        'amount_requested_USD' => null,
        'amount_received_ADA' => null,
        'amount_requested_ADA' => null,
        'amount_received_USD' => null,
        'author' => null,
        'fund_id' => null,
        'fund' => null,
        'list_type' => null
    ]);
    
    expect($dto->id)->toBeNull();
    expect($dto->user_id)->toBeNull();
    expect($dto->title)->toBeNull();
    expect($dto->allow_comments)->toBeNull();
    expect($dto->items_count)->toBeNull();
    expect($dto->author)->toBeNull();
    expect($dto->fund)->toBeNull();
});
