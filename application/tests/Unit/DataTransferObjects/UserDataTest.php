<?php

declare(strict_types=1);

use App\DataTransferObjects\UserData;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class);

it('converts User model to UserData DTO successfully', function () {
    $user = User::factory()->create();

    $dto = $user->toDto();

    expect($dto)->toBeInstanceOf(UserData::class)
        ->and($dto->id)->toBe($user->id)
        ->and($dto->name)->toBe($user->name)
        ->and($dto->email)->toBe($user->email)
        ->and($dto->hero_img_url)->toBe($user->hero_img_url)
        ->and($dto->email_verified_at)->toBe($user->email_verified_at?->format('Y-m-d H:i:s'));
});

it('serializes UserData to array correctly', function () {
    $user = User::factory()->create();
    $dto = $user->toDto();
    $array = $dto->toArray();

    expect($array)->toBeArray()
        ->toHaveKey('id', $user->id)
        ->toHaveKey('name', $user->name)
        ->toHaveKey('email', $user->email)
        ->toHaveKey('hero_img_url', $user->hero_img_url)
        ->toHaveKey('email_verified_at')
        ->toHaveKey('locations');
});

it('handles locations DataCollection in UserData', function () {
    $user = User::factory()->create();
    $dto = $user->toDto();

    expect($dto->locations)->toSatisfy(
        fn($value) => $value === null || $value instanceof \Spatie\LaravelData\DataCollection
    );
});

it('creates UserData from array data', function () {
    $data = [
        'id' => fake()->uuid(),
        'name' => 'Test User',
        'email' => 'test@example.com',
        'hero_img_url' => 'https://example.com/avatar.jpg',
        'email_verified_at' => now()->format('Y-m-d H:i:s'),
        'locations' => null,
    ];

    $dto = UserData::from($data);

    expect($dto)->toBeInstanceOf(UserData::class)
        ->and($dto->id)->toBe($data['id'])
        ->and($dto->name)->toBe('Test User')
        ->and($dto->email)->toBe('test@example.com')
        ->and($dto->hero_img_url)->toBe('https://example.com/avatar.jpg')
        ->and($dto->locations)->toBeNull();
});

it('handles unverified user in UserData', function () {
    $user = User::factory()->unverified()->create();
    $dto = $user->toDto();

    expect($dto)->toBeInstanceOf(UserData::class)
        ->and($dto->email_verified_at)->toBeNull();
});

// Type Validation Tests
it('validates UserData field types from factory', function () {
    $user = User::factory()->create();
    $dto = $user->toDto();

    expect($dto->id)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->name)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->email)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->hero_img_url)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->email_verified_at)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->locations)->toSatisfy(fn($v) => is_null($v) || $v instanceof \Spatie\LaravelData\DataCollection);
});

it('rejects invalid types for UserData', function () {
    expect(fn() => UserData::from([
        'id' => ['invalid'],
        'name' => 123
    ]))->toThrow();
});

it('accepts null values for UserData nullable fields', function () {
    $dto = UserData::from([
        'id' => null,
        'name' => null,
        'email' => null,
        'hero_img_url' => null,
        'email_verified_at' => null,
        'locations' => null,
    ]);

    expect($dto->id)->toBeNull();
    expect($dto->name)->toBeNull();
    expect($dto->email_verified_at)->toBeNull();
    expect($dto->locations)->toBeNull();
});
