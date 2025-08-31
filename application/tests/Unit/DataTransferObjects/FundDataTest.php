<?php

declare(strict_types=1);

use App\DataTransferObjects\FundData;
use App\Models\Fund;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class);

it('converts Fund model to FundData DTO successfully', function () {
    $fund = Fund::factory()->create();

    $dto = $fund->toDto();

    expect($dto)->toBeInstanceOf(FundData::class)
        ->and($dto->id)->toBe($fund->id)
        ->and($dto->amount)->toBe($fund->amount)
        ->and($dto->label)->toBe($fund->label)
        ->and($dto->title)->toBe($fund->title)
        ->and($dto->meta_title)->toBe($fund->meta_title)
        ->and($dto->slug)->toBe($fund->slug)
        ->and($dto->user_id)->toBe($fund->user_id)
        ->and($dto->status)->toBe($fund->status)
        ->and($dto->currency)->toBe($fund->currency);
});

it('serializes FundData to array correctly', function () {
    $fund = Fund::factory()->create();
    $dto = $fund->toDto();
    $array = $dto->toArray();

    expect($array)->toBeArray()
        ->toHaveKey('id', $fund->id)
        ->toHaveKey('amount', $fund->amount)
        ->toHaveKey('label', $fund->label)
        ->toHaveKey('title', $fund->title)
        ->toHaveKey('slug', $fund->slug)
        ->toHaveKey('status', $fund->status)
        ->toHaveKey('currency', $fund->currency)
        ->toHaveKey('launched_at')
        ->toHaveKey('awarded_at')
        ->toHaveKey('review_started_at');
});

it('handles computed proposal counts in FundData', function () {
    $fund = Fund::factory()->create();
    $dto = $fund->toDto();

    expect($dto->proposals_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->funded_proposals_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->completed_proposals_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->unfunded_proposals_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    );
});

it('handles computed amounts in FundData', function () {
    $fund = Fund::factory()->create();
    $dto = $fund->toDto();

    expect($dto->amount_requested)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->amount_awarded)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    );
});

it('handles date attributes with proper casting in FundData', function () {
    $fund = Fund::factory()->create();
    $dto = $fund->toDto();

    // Date fields should be formatted as Y-m-d or null
    expect($dto->launched_at)->toSatisfy(
        fn($value) => $value === null || (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value))
    )->and($dto->awarded_at)->toSatisfy(
        fn($value) => $value === null || (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value))
    )->and($dto->review_started_at)->toSatisfy(
        fn($value) => $value === null || (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value))
    );
});

it('handles image URLs in FundData', function () {
    $fund = Fund::factory()->create();
    $dto = $fund->toDto();

    expect($dto->hero_img_url)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->banner_img_url)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    );
});

it('creates FundData from array data', function () {
    $data = [
        'amount' => 1000000.0,
        'label' => 'F10',
        'title' => 'Fund 10',
        'id' => fake()->uuid(),
        'proposals_count' => 150,
        'funded_proposals_count' => 75,
        'completed_proposals_count' => 50,
        'unfunded_proposals_count' => 75,
        'amount_requested' => 5000000,
        'amount_awarded' => 3000000,
        'meta_title' => 'Fund 10 - Catalyst',
        'slug' => 'fund-10',
        'user_id' => fake()->uuid(),
        'excerpt' => 'Test excerpt',
        'comment_prompt' => 'Share your thoughts',
        'content' => 'Fund description',
        'hero_img_url' => 'https://example.com/hero.jpg',
        'banner_img_url' => 'https://example.com/banner.jpg',
        'status' => 'active',
        'launched_at' => '2023-01-15',
        'awarded_at' => '2023-03-15',
        'color' => '#0066cc',
        'currency' => 'ADA',
        'review_started_at' => '2023-02-01',
        'parent_id' => null,
    ];

    $dto = FundData::from($data);

    expect($dto)->toBeInstanceOf(FundData::class)
        ->and($dto->amount)->toBe(1000000.0)
        ->and($dto->label)->toBe('F10')
        ->and($dto->title)->toBe('Fund 10')
        ->and($dto->proposals_count)->toBe(150)
        ->and($dto->funded_proposals_count)->toBe(75)
        ->and($dto->amount_requested)->toBe(5000000)
        ->and($dto->amount_awarded)->toBe(3000000)
        ->and($dto->status)->toBe('active')
        ->and($dto->currency)->toBe('ADA')
        ->and($dto->launched_at)->toBe('2023-01-15')
        ->and($dto->awarded_at)->toBe('2023-03-15')
        ->and($dto->review_started_at)->toBe('2023-02-01');
});

it('handles content and prompts in FundData', function () {
    $fund = Fund::factory()->create();
    $dto = $fund->toDto();

    expect($dto->excerpt)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->comment_prompt)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->content)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    );
});

it('handles color attribute in FundData', function () {
    $fund = Fund::factory()->create();
    $dto = $fund->toDto();

    expect($dto->color)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    );
});

it('handles parent relationship in FundData', function () {
    $fund = Fund::factory()->create();
    $dto = $fund->toDto();

    expect($dto->parent_id)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    );
});

// Type Validation Tests
it('validates FundData field types from factory', function () {
    $fund = Fund::factory()->create();
    $dto = $fund->toDto();

    expect($dto->id)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->amount)->toSatisfy(fn($v) => is_null($v) || is_float($v) || is_int($v));
    expect($dto->label)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->title)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->proposals_count)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->amount_requested)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->amount_awarded)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->launched_at)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->awarded_at)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->review_started_at)->toSatisfy(fn($v) => is_null($v) || is_string($v));
});

it('rejects invalid types for FundData numeric fields', function () {
    expect(fn() => FundData::from([
        'amount' => 'not-a-number',
        'proposals_count' => 'ten',
        'amount_awarded' => 'nope'
    ]))->toThrow();
});

it('accepts null values for FundData nullable fields', function () {
    $dto = FundData::from([
        'amount' => null,
        'label' => null,
        'title' => null,
        'id' => null,
        'proposals_count' => null,
        'amount_requested' => null,
        'amount_awarded' => null,
        'launched_at' => null,
        'awarded_at' => null,
        'review_started_at' => null,
    ]);

    expect($dto->amount)->toBeNull();
    expect($dto->proposals_count)->toBeNull();
    expect($dto->launched_at)->toBeNull();
});
