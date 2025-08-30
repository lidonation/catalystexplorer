<?php

declare(strict_types=1);

use App\Models\Group;
use App\Models\User;
use App\Models\CatalystDrep;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class);

it('converts collection of models to DTO collection', function () {
    $groups = Group::factory()->count(3)->create();
    
    $dtoCollection = Group::toDtoCollection($groups);

    expect($dtoCollection)->toHaveCount(3);
    
    $dtoCollection->each(function ($dto) {
        expect($dto)->toBeInstanceOf(\App\DataTransferObjects\GroupData::class);
    });
});

it('converts paginated models to DTO paginated collection', function () {
    Group::factory()->count(5)->create();
    
    $paginator = Group::paginate(2);
    $dtoPaginator = Group::toDtoPaginated($paginator);

    expect($dtoPaginator->items())->toHaveCount(2);
    expect($dtoPaginator->total())->toBe(5);
    
    collect($dtoPaginator->items())->each(function ($dto) {
        expect($dto)->toBeInstanceOf(\App\DataTransferObjects\GroupData::class);
    });
});

it('handles mixed collection with non-model items', function () {
    $groups = Group::factory()->count(2)->create();
    $collection = collect([
        $groups[0],
        ['raw_array' => 'data'],
        $groups[1],
        'string_item'
    ]);
    
    $dtoCollection = Group::toDtoCollection($collection);

    expect($dtoCollection)->toHaveCount(4);
    expect($dtoCollection[0])->toBeInstanceOf(\App\DataTransferObjects\GroupData::class);
    expect($dtoCollection[1])->toBe(['raw_array' => 'data']);
    expect($dtoCollection[2])->toBeInstanceOf(\App\DataTransferObjects\GroupData::class);
    expect($dtoCollection[3])->toBe('string_item');
});

it('converts array of models to DTO collection', function () {
    $users = User::factory()->count(3)->create();
    $userArray = $users->toArray();
    
    $dtoCollection = User::toDtoCollection($userArray);

    expect($dtoCollection)->toHaveCount(3);
    
    // Since these are arrays, not model objects, they should remain as arrays
    $dtoCollection->each(function ($item) {
        expect($item)->toBeArray();
    });
});

it('handles empty collection', function () {
    $dtoCollection = Group::toDtoCollection(collect());

    expect($dtoCollection)->toHaveCount(0);
    expect($dtoCollection)->toBeInstanceOf(\Illuminate\Support\Collection::class);
});

it('resolves correct DTO class for different models', function () {
    $group = Group::factory()->create();
    $user = User::factory()->create();
    $drep = CatalystDrep::factory()->create();
    
    $groupDto = $group->toDto();
    $userDto = $user->toDto();
    $drepDto = $drep->toDto();

    expect($groupDto)->toBeInstanceOf(\App\DataTransferObjects\GroupData::class);
    expect($userDto)->toBeInstanceOf(\App\DataTransferObjects\UserData::class);
    expect($drepDto)->toBeInstanceOf(\App\DataTransferObjects\CatalystDrepData::class);
});
