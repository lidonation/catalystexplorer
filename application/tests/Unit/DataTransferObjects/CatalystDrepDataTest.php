<?php

declare(strict_types=1);

use App\DataTransferObjects\CatalystDrepData;
use App\Models\CatalystDrep;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class);

it('converts CatalystDrep model to CatalystDrepData DTO successfully', function () {
    $drep = CatalystDrep::factory()->create();

    $dto = $drep->toDto();

    expect($dto)->toBeInstanceOf(CatalystDrepData::class)
        ->and($dto->id)->toBe($drep->id)
        ->and($dto->name)->toBe($drep->name)
        ->and($dto->email)->toBe($drep->email)
        ->and($dto->link)->toBe($drep->link)
        ->and($dto->bio)->toBe($drep->bio)
        ->and($dto->motivation)->toBe($drep->motivation)
        ->and($dto->qualifications)->toBe($drep->qualifications)
        ->and($dto->objective)->toBe($drep->objective);
});

it('serializes CatalystDrepData to array correctly', function () {
    $drep = CatalystDrep::factory()->create();
    $dto = $drep->toDto();
    $array = $dto->toArray();

    expect($array)->toBeArray()
        ->toHaveKey('id', $drep->id)
        ->toHaveKey('name', $drep->name)
        ->toHaveKey('email', $drep->email)
        ->toHaveKey('link', $drep->link)
        ->toHaveKey('bio', $drep->bio)
        ->toHaveKey('motivation', $drep->motivation)
        ->toHaveKey('qualifications', $drep->qualifications)
        ->toHaveKey('objective', $drep->objective);
});

it('handles computed attributes in CatalystDrepData', function () {
    $drep = CatalystDrep::factory()->create();
    $dto = $drep->toDto();

    // These are computed attributes from the model
    expect($dto->stake_address)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->voting_power)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->last_active)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->status)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->locale)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->delegators_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    );
});

it('creates CatalystDrepData from array data', function () {
    $data = [
        'id' => fake()->uuid(),
        'name' => 'Test Drep',
        'email' => 'test@example.com',
        'link' => 'https://example.com',
        'bio' => 'Test bio',
        'motivation' => 'Test motivation',
        'qualifications' => 'Test qualifications',
        'objective' => 'Test objective',
        'stake_address' => null,
        'voting_power' => null,
        'last_active' => null,
        'status' => 'active',
        'locale' => 'en',
        'delegators_count' => 0,
    ];

    $dto = CatalystDrepData::from($data);

    expect($dto)->toBeInstanceOf(CatalystDrepData::class)
        ->and($dto->id)->toBe($data['id'])
        ->and($dto->name)->toBe('Test Drep')
        ->and($dto->email)->toBe('test@example.com')
        ->and($dto->status)->toBe('active')
        ->and($dto->locale)->toBe('en')
        ->and($dto->delegators_count)->toBe(0);
});

// Type Validation Tests
it('validates CatalystDrepData field types from factory', function () {
    $drep = CatalystDrep::factory()->create();
    $dto = $drep->toDto();

    expect($dto->id)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->name)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->email)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->link)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->bio)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->motivation)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->qualifications)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->objective)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->stake_address)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->voting_power)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->last_active)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->status)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->locale)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->delegators_count)->toSatisfy(fn($v) => is_null($v) || is_int($v));
});

it('rejects invalid types for CatalystDrepData integer fields', function () {
    expect(fn() => CatalystDrepData::from([
        'voting_power' => 'nope',
        'delegators_count' => 'nope'
    ]))->toThrow();
});

it('accepts null values for CatalystDrepData nullable fields', function () {
    $dto = CatalystDrepData::from([
        'id' => null,
        'name' => null,
        'email' => null,
        'link' => null,
        'bio' => null,
        'motivation' => null,
        'qualifications' => null,
        'objective' => null,
        'stake_address' => null,
        'voting_power' => null,
        'last_active' => null,
        'status' => null,
        'locale' => null,
        'delegators_count' => null,
    ]);

    expect($dto->name)->toBeNull();
    expect($dto->voting_power)->toBeNull();
    expect($dto->delegators_count)->toBeNull();
});
