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
