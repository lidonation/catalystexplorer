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
