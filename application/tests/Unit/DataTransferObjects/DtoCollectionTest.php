<?php

declare(strict_types=1);

use App\Models\Group;
use App\Models\User;
use App\Models\CatalystDrep;
use App\DataTransferObjects\GroupData;
use App\DataTransferObjects\UserData;
use App\DataTransferObjects\CatalystDrepData;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class);

// GroupData Type Validation Tests
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
    
    // Nullable float fields
    expect($dto->amount_awarded_ada)->toSatisfy(fn($value) => is_null($value) || is_float($value));
    expect($dto->amount_awarded_usd)->toSatisfy(fn($value) => is_null($value) || is_float($value));
    expect($dto->amount_requested_ada)->toSatisfy(fn($value) => is_null($value) || is_float($value));
    expect($dto->amount_requested_usd)->toSatisfy(fn($value) => is_null($value) || is_float($value));
    expect($dto->amount_distributed_ada)->toSatisfy(fn($value) => is_null($value) || is_float($value));
    expect($dto->amount_distributed_usd)->toSatisfy(fn($value) => is_null($value) || is_float($value));
    
    // Nullable integer fields
    expect($dto->proposals_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->completed_proposals_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->funded_proposals_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->unfunded_proposals_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->proposals_funded)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->proposals_unfunded)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->proposals_completed)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->reviews_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    
    // DataCollection field
    expect($dto->ideascale_profiles)->toSatisfy(fn($value) => is_null($value) || $value instanceof \Spatie\LaravelData\DataCollection);
});

it('rejects invalid types for GroupData string fields', function () {
    expect(fn() => GroupData::from([
        'id' => 123, // should be string
        'name' => ['invalid', 'array']
    ]))->toThrow();
});

it('rejects invalid types for GroupData numeric fields', function () {
    expect(fn() => GroupData::from([
        'id' => 'valid-id',
        'amount_awarded_ada' => 'not-a-number', // should be float
        'proposals_count' => 'not-an-integer' // should be int
    ]))->toThrow();
});

// UserData Type Validation Tests
it('validates UserData field types from factory data', function () {
    $user = User::factory()->create();
    $dto = $user->toDto();
    
    // All UserData fields are nullable strings except DataCollection
    expect($dto->id)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->name)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->email)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->hero_img_url)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->email_verified_at)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    
    // DataCollection field
    expect($dto->locations)->toSatisfy(fn($value) => is_null($value) || $value instanceof \Spatie\LaravelData\DataCollection);
});

it('rejects invalid types for UserData', function () {
    expect(fn() => UserData::from([
        'id' => ['not', 'a', 'string'],
        'name' => 12345
    ]))->toThrow();
});

// CatalystDrepData Type Validation Tests
it('validates CatalystDrepData field types from factory data', function () {
    $drep = CatalystDrep::factory()->create();
    $dto = $drep->toDto();
    
    // Nullable string fields
    expect($dto->id)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->name)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->email)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->link)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->bio)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->motivation)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->qualifications)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->objective)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->stake_address)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->last_active)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->status)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    expect($dto->locale)->toSatisfy(fn($value) => is_null($value) || is_string($value));
    
    // Nullable integer fields
    expect($dto->voting_power)->toSatisfy(fn($value) => is_null($value) || is_int($value));
    expect($dto->delegators_count)->toSatisfy(fn($value) => is_null($value) || is_int($value));
});

it('rejects invalid types for CatalystDrepData', function () {
    expect(fn() => CatalystDrepData::from([
        'voting_power' => 'should-be-int',
        'delegators_count' => ['not', 'an', 'int']
    ]))->toThrow();
});
