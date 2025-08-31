<?php

declare(strict_types=1);

use App\DataTransferObjects\GroupData;
use App\Models\Group;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class);

it('converts Group model to GroupData DTO successfully', function () {
    $group = Group::factory()->create();

    $dto = $group->toDto();

    expect($dto)->toBeInstanceOf(GroupData::class)
        ->and($dto->id)->toBe($group->id)
        ->and($dto->name)->toBe($group->name)
        ->and($dto->slug)->toBe($group->slug)
        ->and($dto->status)->toBe($group->status)
        ->and($dto->website)->toBe($group->website)
        ->and($dto->twitter)->toBe($group->twitter)
        ->and($dto->discord)->toBe($group->discord)
        ->and($dto->github)->toBe($group->github);
});

it('serializes GroupData to array correctly', function () {
    $group = Group::factory()->create();
    $dto = $group->toDto();
    $array = $dto->toArray();

    expect($array)->toBeArray()
        ->toHaveKey('id', $group->id)
        ->toHaveKey('name', $group->name)
        ->toHaveKey('bio')
        ->toHaveKey('created_at')
        ->toHaveKey('updated_at')
        ->toHaveKey('hero_img_url');
});

it('handles computed attributes in GroupData', function () {
    $group = Group::factory()->create();
    $dto = $group->toDto();

    expect($dto->amount_awarded_ada)->toBeFloat()
        ->and($dto->amount_awarded_usd)->toBeFloat()
        ->and($dto->amount_requested_ada)->toBeFloat()
        ->and($dto->amount_requested_usd)->toBeFloat()
        ->and($dto->amount_distributed_ada)->toBeFloat()
        ->and($dto->amount_distributed_usd)->toBeFloat()
        ->and($dto->proposals_count)->toBeInt()
        ->and($dto->completed_proposals_count)->toBeInt()
        ->and($dto->funded_proposals_count)->toBeInt()
        ->and($dto->unfunded_proposals_count)->toBeInt();
});

it('handles ideascale_profiles DataCollection in GroupData', function () {
    $group = Group::factory()->create();
    $dto = $group->toDto();

    expect($dto->ideascale_profiles)->toSatisfy(
        fn($value) => $value === null || $value instanceof \Spatie\LaravelData\DataCollection
    );
});



// Type Validation Tests
it('validates GroupData field types from factory data', function () {
    $group = Group::factory()->create();
    $dto = $group->toDto();
    
    // Required string field
    expect($dto->id)->toBeString();
    
    // Nullable string fields
    expect($dto->user_id)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->name)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->hero_img_url)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->banner_img_url)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->slug)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->status)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->meta_title)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->website)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->twitter)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->discord)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->github)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->linkedin)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->created_at)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->updated_at)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->deleted_at)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    
    // Union type field (array|string|null)
    expect($dto->bio)->toSatisfy(fn($value) => is_null($value) || is_string($value) || is_array($value));
    
    // Nullable numeric fields
    expect($dto->amount_awarded_ada)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    expect($dto->amount_awarded_usd)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    expect($dto->amount_requested_ada)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    expect($dto->amount_requested_usd)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    expect($dto->amount_distributed_ada)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    expect($dto->amount_distributed_usd)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    
    // Nullable integer fields
    expect($dto->proposals_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->completed_proposals_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->funded_proposals_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->unfunded_proposals_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->proposals_funded)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->proposals_unfunded)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->proposals_completed)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->reviews_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
});

it('rejects invalid types for GroupData required fields', function () {
    expect(fn() => GroupData::from([
        'id' => 123 // should be string
    ]))->toThrow();
});

it('rejects invalid types for GroupData string fields', function () {
    expect(fn() => GroupData::from([
        'id' => 'valid-string-id',
        'name' => ['invalid', 'array'] // should be string or null
    ]))->toThrow();
});

it('rejects invalid types for GroupData numeric fields', function () {
    expect(fn() => GroupData::from([
        'id' => 'valid-string-id',
        'amount_awarded_ada' => 'not-a-number',
        'proposals_count' => 'not-an-integer'
    ]))->toThrow();
});

// Type Validation Tests
it('validates GroupData field types from factory data', function () {
    $group = Group::factory()->create();
    $dto = $group->toDto();
    
    // Required string field
    expect($dto->id)->toBeString();
    
    // Nullable string fields
    expect($dto->user_id)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->name)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->hero_img_url)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->banner_img_url)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->slug)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->status)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->meta_title)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->website)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->twitter)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->discord)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->github)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->linkedin)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->created_at)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->updated_at)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->deleted_at)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    
    // Union type field (array|string|null)
    expect($dto->bio)->toSatisfy(fn($value) => is_null($value) || is_string($value) || is_array($value));
    
    // Nullable numeric fields (allowing both int and float for computed values)
    expect($dto->amount_awarded_ada)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    expect($dto->amount_awarded_usd)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    expect($dto->amount_requested_ada)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    expect($dto->amount_requested_usd)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    expect($dto->amount_distributed_ada)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    expect($dto->amount_distributed_usd)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    
    // Nullable integer fields
    expect($dto->proposals_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->completed_proposals_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->funded_proposals_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->unfunded_proposals_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->proposals_funded)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->proposals_unfunded)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->proposals_completed)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->reviews_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
});

it('rejects invalid types for GroupData required fields', function () {
    expect(fn() => GroupData::from([
        'id' => 123 // should be string
    ]))->toThrow();
});

it('rejects invalid types for GroupData string fields', function () {
    expect(fn() => GroupData::from([
        'id' => 'valid-string-id',
        'name' => ['invalid', 'array'] // should be string or null
    ]))->toThrow();
});

it('rejects invalid types for GroupData numeric fields', function () {
    expect(fn() => GroupData::from([
        'id' => 'valid-string-id',
        'amount_awarded_ada' => 'not-a-number', // should be numeric or null
        'proposals_count' => 'not-an-integer' // should be int or null
    ]))->toThrow();
});

// Type Validation Tests
it('validates GroupData field types from factory data', function () {
    $group = Group::factory()->create();
    $dto = $group->toDto();
    
    // Required string field
    expect($dto->id)->toBeString();
    
    // Nullable string fields
    expect($dto->user_id)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->name)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->hero_img_url)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->banner_img_url)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->slug)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->status)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->meta_title)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->website)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->twitter)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->discord)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->github)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->linkedin)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->created_at)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->updated_at)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->deleted_at)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    
    // Union type field (array|string|null)
    expect($dto->bio)->toSatisfy(fn($value) => is_null($value) || is_string($value) || is_array($value));
    
    // Nullable numeric fields (allowing both int and float for computed values)
    expect($dto->amount_awarded_ada)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    expect($dto->amount_awarded_usd)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    expect($dto->amount_requested_ada)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    expect($dto->amount_requested_usd)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    expect($dto->amount_distributed_ada)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    expect($dto->amount_distributed_usd)->toSatisfy(fn($value) => is_null($value) || is_numeric($value));
    
    // Nullable integer fields
    expect($dto->proposals_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->completed_proposals_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->funded_proposals_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->unfunded_proposals_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->proposals_funded)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->proposals_unfunded)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->proposals_completed)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->reviews_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
});

it('rejects invalid types for GroupData string fields', function () {
    expect(fn() => GroupData::from([
        'id' => 123 // should be string
    ]))->toThrow();
    
    expect(fn() => GroupData::from([
        'id' => 'valid-string-id',
        'name' => ['invalid', 'array'] // should be string or null
    ]))->toThrow();
});

it('rejects invalid types for GroupData numeric fields', function () {
    expect(fn() => GroupData::from([
        'id' => 'valid-string-id',
        'amount_awarded_ada' => 'not-a-number', // should be numeric or null
        'proposals_count' => 'not-an-integer' // should be int or null
    ]))->toThrow();
});

it('accepts null values for GroupData nullable fields', function () {
    $dto = GroupData::from([
        'id' => 'test-id',
        'user_id' => null,
        'name' => null,
        'bio' => null,
        'amount_awarded_ada' => null,
        'proposals_count' => null,
        'ideascale_profiles' => null
    ]);
    
    expect($dto->id)->toBe('test-id');
    expect($dto->user_id)->toBeNull();
    expect($dto->name)->toBeNull();
    expect($dto->bio)->toBeNull();
    expect($dto->amount_awarded_ada)->toBeNull();
    expect($dto->proposals_count)->toBeNull();
    expect($dto->ideascale_profiles)->toBeNull();
});
