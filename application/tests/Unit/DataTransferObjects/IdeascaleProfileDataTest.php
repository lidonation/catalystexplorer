<?php

declare(strict_types=1);

use App\DataTransferObjects\IdeascaleProfileData;
use App\Models\IdeascaleProfile;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class);

it('converts IdeascaleProfile model to IdeascaleProfileData DTO successfully', function () {
    $profile = IdeascaleProfile::factory()->create();

    $dto = $profile->toDto();

    expect($dto)->toBeInstanceOf(IdeascaleProfileData::class)
        ->and($dto->id)->toBe($profile->id)
        ->and($dto->ideascaleId)->toBe($profile->ideascaleId)
        ->and($dto->username)->toBe($profile->username)
        ->and($dto->email)->toBe($profile->email)
        ->and($dto->name)->toBe($profile->name)
        ->and($dto->bio)->toBe($profile->bio)
        ->and($dto->twitter)->toBe($profile->twitter)
        ->and($dto->linkedin)->toBe($profile->linkedin)
        ->and($dto->discord)->toBe($profile->discord);
});

it('serializes IdeascaleProfileData to array correctly', function () {
    $profile = IdeascaleProfile::factory()->create();
    $dto = $profile->toDto();
    $array = $dto->toArray();

    expect($array)->toBeArray()
        ->toHaveKey('id', $profile->id)
        ->toHaveKey('username', $profile->username)
        ->toHaveKey('name', $profile->name)
        ->toHaveKey('bio', $profile->bio)
        ->toHaveKey('twitter', $profile->twitter)
        ->toHaveKey('linkedin', $profile->linkedin)
        ->toHaveKey('discord', $profile->discord)
        ->toHaveKey('createdAt')
        ->toHaveKey('updatedAt')
        ->toHaveKey('hero_img_url')
        ->toHaveKey('reviews');
});

it('handles social media links in IdeascaleProfileData', function () {
    $profile = IdeascaleProfile::factory()->create();
    $dto = $profile->toDto();

    expect($dto->twitter)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->linkedin)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->discord)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->ideascale)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->telegram)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    );
});

it('handles computed amounts in IdeascaleProfileData', function () {
    $profile = IdeascaleProfile::factory()->create();
    $dto = $profile->toDto();

    expect($dto->amount_awarded_usd)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->amount_awarded_ada)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->amount_requested_ada)->toSatisfy(
        fn($value) => $value === null || is_float($value)
    )->and($dto->amount_requested_usd)->toSatisfy(
        fn($value) => $value === null || is_float($value)
    )->and($dto->amount_distributed_ada)->toSatisfy(
        fn($value) => $value === null || is_float($value)
    )->and($dto->amount_distributed_usd)->toSatisfy(
        fn($value) => $value === null || is_float($value)
    );
});

it('handles proposal counts in IdeascaleProfileData', function () {
    $profile = IdeascaleProfile::factory()->create();
    $dto = $profile->toDto();

    expect($dto->co_proposals_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->own_proposals_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->completed_proposals_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->funded_proposals_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->unfunded_proposals_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->proposals_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->collaborating_proposals_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    );
});

it('handles claimed_by relationship in IdeascaleProfileData', function () {
    $profile = IdeascaleProfile::factory()->create();
    $profile->load('claimed_by');
    $dto = $profile->toDto();

    expect($dto->claimed_by)->toSatisfy(
        fn($value) => $value === null || $value instanceof \App\DataTransferObjects\UserData
    );
});

it('handles reviews DataCollection in IdeascaleProfileData', function () {
    $profile = IdeascaleProfile::factory()->create();
    $profile->load('reviews');
    $dto = $profile->toDto();

    expect($dto->reviews)->toSatisfy(
        fn($value) => $value === null || $value instanceof \Spatie\LaravelData\DataCollection
    );
});

it('handles groups relationship in IdeascaleProfileData', function () {
    $profile = IdeascaleProfile::factory()->create();
    $dto = $profile->toDto();

    // groups can be various types based on the model
    expect($dto->groups)->toSatisfy(
        fn($value) => $value === null || is_array($value) || is_object($value)
    );
});

it('handles other counts in IdeascaleProfileData', function () {
    $profile = IdeascaleProfile::factory()->create();
    $dto = $profile->toDto();

    expect($dto->reviews_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    );
});

it('creates IdeascaleProfileData from array data', function () {
    $userData = [
        'id' => fake()->uuid(),
        'name' => 'Test User',
        'email' => 'test@example.com',
        'hero_img_url' => null,
        'email_verified_at' => null,
        'locations' => null,
    ];

    $data = [
        'id' => fake()->uuid(),
        'ideascaleId' => 12345,
        'username' => 'testuser',
        'email' => 'test@example.com',
        'name' => 'Test User',
        'bio' => 'Test bio',
        'createdAt' => now()->format('Y-m-d H:i:s'),
        'updatedAt' => now()->format('Y-m-d H:i:s'),
        'twitter' => '@testuser',
        'linkedin' => 'testuser',
        'discord' => 'testuser#1234',
        'ideascale' => 'https://ideascale.com/user/test',
        'telegram' => '@testuser',
        'title' => 'Test Title',
        'hero_img_url' => 'https://example.com/avatar.jpg',
        'amount_awarded_usd' => 5000,
        'amount_awarded_ada' => 10000,
        'amount_requested_ada' => 15000.0,
        'amount_requested_usd' => 7500.0,
        'amount_distributed_ada' => 8000.0,
        'amount_distributed_usd' => 4000.0,
        'co_proposals_count' => 5,
        'own_proposals_count' => 3,
        'claimed_by_uuid' => fake()->uuid(),
        'completed_proposals_count' => 2,
        'funded_proposals_count' => 3,
        'unfunded_proposals_count' => 2,
        'proposals_count' => 5,
        'reviews_count' => 10,
        'collaborating_proposals_count' => 5,
        'groups' => null,
        'claimed_by' => $userData,
        'reviews' => null,
    ];

    $dto = IdeascaleProfileData::from($data);

    expect($dto)->toBeInstanceOf(IdeascaleProfileData::class)
        ->and($dto->id)->toBe($data['id'])
        ->and($dto->ideascaleId)->toBe(12345)
        ->and($dto->username)->toBe('testuser')
        ->and($dto->name)->toBe('Test User')
        ->and($dto->bio)->toBe('Test bio')
        ->and($dto->twitter)->toBe('@testuser')
        ->and($dto->amount_awarded_ada)->toBe(10000)
        ->and($dto->amount_requested_ada)->toBe(15000.0)
        ->and($dto->co_proposals_count)->toBe(5)
        ->and($dto->own_proposals_count)->toBe(3)
        ->and($dto->claimed_by)->toBeInstanceOf(\App\DataTransferObjects\UserData::class)
        ->and($dto->claimed_by->name)->toBe('Test User');
});

it('handles date formatting in IdeascaleProfileData', function () {
    $profile = IdeascaleProfile::factory()->create();
    $dto = $profile->toDto();

    expect($dto->createdAt)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->updatedAt)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    );
});

it('handles title and hero_img_url in IdeascaleProfileData', function () {
    $profile = IdeascaleProfile::factory()->create();
    $dto = $profile->toDto();

    expect($dto->title)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->hero_img_url)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    );
});

// Type Validation Tests
it('validates IdeascaleProfileData field types from factory', function () {
    $profile = IdeascaleProfile::factory()->create();
    $dto = $profile->toDto();

    expect($dto->id)->toBeString();
    expect($dto->ideascaleId)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->username)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->email)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->name)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->createdAt)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->updatedAt)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->amount_awarded_usd)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->amount_requested_ada)->toSatisfy(fn($v) => is_null($v) || is_float($v) || is_int($v));
});

it('rejects invalid types for IdeascaleProfileData numeric fields', function () {
    expect(fn() => IdeascaleProfileData::from([
        'ideascaleId' => 'not-int',
        'amount_awarded_usd' => 'not-int',
        'amount_requested_ada' => 'not-float'
    ]))->toThrow();
});

it('accepts null values for IdeascaleProfileData nullable fields', function () {
    $dto = IdeascaleProfileData::from([
        'id' => '1',
        'ideascaleId' => null,
        'username' => null,
        'email' => null,
        'name' => null,
        'bio' => null,
        'createdAt' => null,
        'updatedAt' => null,
        'twitter' => null,
        'linkedin' => null,
        'discord' => null,
        'ideascale' => null,
        'telegram' => null,
        'title' => null,
        'hero_img_url' => null,
        'amount_awarded_usd' => null,
        'amount_awarded_ada' => null,
        'amount_requested_ada' => null,
        'amount_requested_usd' => null,
        'co_proposals_count' => null,
        'own_proposals_count' => null,
        'completed_proposals_count' => null,
        'funded_proposals_count' => null,
        'unfunded_proposals_count' => null,
        'proposals_count' => null,
        'reviews_count' => null,
        'collaborating_proposals_count' => null,
        'groups' => null,
        'claimed_by' => null,
        'reviews' => null,
    ]);

    expect($dto->ideascaleId)->toBeNull();
    expect($dto->username)->toBeNull();
    expect($dto->amount_awarded_usd)->toBeNull();
});
