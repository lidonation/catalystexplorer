<?php

declare(strict_types=1);

use App\DataTransferObjects\GroupData;
use App\DataTransferObjects\UserData;
use App\DataTransferObjects\CatalystDrepData;
use App\Models\Group;
use App\Models\User;
use App\Models\CatalystDrep;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class);

it('serializes and deserializes GroupData correctly', function () {
    $group = Group::factory()->create();
    $originalDto = $group->toDto();
    
    // Serialize to JSON
    $json = $originalDto->toJson();
    expect($json)->toBeString();
    
    // Deserialize from array
    $array = json_decode($json, true);
    $newDto = GroupData::from($array);
    
    expect($newDto)->toBeInstanceOf(GroupData::class)
        ->and($newDto->id)->toBe($originalDto->id)
        ->and($newDto->name)->toBe($originalDto->name)
        ->and($newDto->status)->toBe($originalDto->status);
});

it('serializes and deserializes UserData correctly', function () {
    $user = User::factory()->create();
    $originalDto = $user->toDto();
    
    $json = $originalDto->toJson();
    expect($json)->toBeString();
    
    $array = json_decode($json, true);
    $newDto = UserData::from($array);
    
    expect($newDto)->toBeInstanceOf(UserData::class)
        ->and($newDto->id)->toBe($originalDto->id)
        ->and($newDto->name)->toBe($originalDto->name)
        ->and($newDto->email)->toBe($originalDto->email);
});

it('serializes and deserializes CatalystDrepData correctly', function () {
    $drep = CatalystDrep::factory()->create();
    $originalDto = $drep->toDto();
    
    $json = $originalDto->toJson();
    expect($json)->toBeString();
    
    $array = json_decode($json, true);
    $newDto = CatalystDrepData::from($array);
    
    expect($newDto)->toBeInstanceOf(CatalystDrepData::class)
        ->and($newDto->id)->toBe($originalDto->id)
        ->and($newDto->name)->toBe($originalDto->name)
        ->and($newDto->email)->toBe($originalDto->email);
});

it('handles null values in serialization', function () {
    $data = [
        'id' => fake()->uuid(),
        'name' => null,
        'email' => null,
        'hero_img_url' => null,
        'email_verified_at' => null,
        'locations' => null,
    ];
    
    $dto = UserData::from($data);
    $array = $dto->toArray();
    
    expect($array['name'])->toBeNull()
        ->and($array['email'])->toBeNull()
        ->and($array['hero_img_url'])->toBeNull()
        ->and($array['email_verified_at'])->toBeNull()
        ->and($array['locations'])->toBeNull();
});

it('preserves data types after serialization roundtrip', function () {
    $group = Group::factory()->create();
    $originalDto = $group->toDto();
    
    $array = $originalDto->toArray();
    $newDto = GroupData::from($array);
    
    // Check that computed float values are preserved as floats
    expect($newDto->amount_awarded_ada)->toBeFloat()
        ->and($newDto->amount_awarded_usd)->toBeFloat()
        ->and($newDto->amount_requested_ada)->toBeFloat()
        ->and($newDto->amount_requested_usd)->toBeFloat();
    
    // Check that computed int values are preserved as ints  
    expect($newDto->proposals_count)->toBeInt()
        ->and($newDto->completed_proposals_count)->toBeInt()
        ->and($newDto->funded_proposals_count)->toBeInt()
        ->and($newDto->unfunded_proposals_count)->toBeInt();
});

it('validates required fields are present in DTO creation', function () {
    // Test that creating a DTO with missing required fields fails appropriately
    expect(fn() => GroupData::from([]))->toThrow();
    expect(fn() => UserData::from([]))->toThrow();
    expect(fn() => CatalystDrepData::from([]))->toThrow();
});

it('handles TypeScript transformer attributes', function () {
    $group = Group::factory()->create();
    $dto = $group->toDto();
    
    // The DTOs should be marked with TypeScript attributes
    $reflection = new ReflectionClass($dto);
    $attributes = $reflection->getAttributes();
    
    $hasTypeScriptAttribute = collect($attributes)->contains(
        fn($attribute) => str_contains($attribute->getName(), 'TypeScript')
    );
    
    expect($hasTypeScriptAttribute)->toBeTrue();
});

it('converts collection of models to JSON correctly', function () {
    $groups = Group::factory()->count(3)->create();
    $dtoCollection = Group::toDtoCollection($groups);
    
    $json = $dtoCollection->toJson();
    expect($json)->toBeString();
    
    $decodedArray = json_decode($json, true);
    expect($decodedArray)->toBeArray()
        ->toHaveCount(3);
    
    foreach ($decodedArray as $item) {
        expect($item)->toBeArray()
            ->toHaveKey('id')
            ->toHaveKey('name');
    }
});
