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
