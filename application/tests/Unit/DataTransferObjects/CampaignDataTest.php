<?php

declare(strict_types=1);

use App\DataTransferObjects\CampaignData;
use App\Models\Campaign;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class);

it('converts Campaign model to CampaignData DTO successfully', function () {
    $campaign = Campaign::factory()->create();

    $dto = $campaign->toDto();

    expect($dto)->toBeInstanceOf(CampaignData::class)
        ->and($dto->id)->toBe($campaign->id)
        ->and($dto->fund_id)->toBe($campaign->fund_id)
        ->and($dto->title)->toBe($campaign->title)
        ->and($dto->meta_title)->toBe($campaign->meta_title)
        ->and($dto->slug)->toBe($campaign->slug)
        ->and($dto->excerpt)->toBe($campaign->excerpt)
        ->and($dto->amount)->toBe($campaign->amount)
        ->and($dto->currency)->toBe($campaign->currency);
});

it('serializes CampaignData to array correctly', function () {
    $campaign = Campaign::factory()->create();
    $dto = $campaign->toDto();
    $array = $dto->toArray();

    expect($array)->toBeArray()
        ->toHaveKey('id', $campaign->id)
        ->toHaveKey('fund_id', $campaign->fund_id)
        ->toHaveKey('title', $campaign->title)
        ->toHaveKey('slug', $campaign->slug)
        ->toHaveKey('amount', $campaign->amount)
        ->toHaveKey('currency', $campaign->currency)
        ->toHaveKey('created_at')
        ->toHaveKey('updated_at')
        ->toHaveKey('proposals_count')
        ->toHaveKey('total_requested')
        ->toHaveKey('total_awarded')
        ->toHaveKey('total_distributed');
});

it('handles fund relationship in CampaignData', function () {
    $campaign = Campaign::factory()->create();
    $campaign->load('fund');
    $dto = $campaign->toDto();

    expect($dto->fund)->toSatisfy(
        fn($value) => $value === null || $value instanceof \App\DataTransferObjects\FundData
    );
});

it('handles proposal counts in CampaignData', function () {
    $campaign = Campaign::factory()->create();
    $dto = $campaign->toDto();

    expect($dto->proposals_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->unfunded_proposals_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->funded_proposals_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->completed_proposals_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    );
});

it('handles total amounts with MapInputName in CampaignData', function () {
    $campaign = Campaign::factory()->create();
    $dto = $campaign->toDto();

    expect($dto->total_requested)->toSatisfy(
        fn($value) => $value === null || is_float($value)
    )->and($dto->total_awarded)->toSatisfy(
        fn($value) => $value === null || is_float($value)
    )->and($dto->total_distributed)->toSatisfy(
        fn($value) => $value === null || is_float($value)
    );
});

it('handles content attributes in CampaignData', function () {
    $campaign = Campaign::factory()->create();
    $dto = $campaign->toDto();

    expect($dto->comment_prompt)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->content)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->hero_img_url)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    );
});

it('creates CampaignData from array data', function () {
    $fundData = [
        'amount' => 500000.0,
        'label' => 'F10',
        'title' => 'Fund 10',
        'id' => fake()->uuid(),
        'proposals_count' => 100,
        'funded_proposals_count' => 50,
        'completed_proposals_count' => 25,
        'unfunded_proposals_count' => 50,
        'amount_requested' => null,
        'amount_awarded' => null,
        'meta_title' => null,
        'slug' => 'fund-10',
        'user_id' => null,
        'excerpt' => null,
        'comment_prompt' => null,
        'content' => null,
        'hero_img_url' => null,
        'banner_img_url' => null,
        'status' => 'active',
        'launched_at' => null,
        'awarded_at' => null,
        'color' => null,
        'currency' => 'ADA',
        'review_started_at' => null,
        'parent_id' => null,
    ];

    $data = [
        'id' => fake()->uuid(),
        'fund_id' => fake()->uuid(),
        'title' => 'Test Campaign',
        'meta_title' => 'Test Campaign - Catalyst',
        'slug' => 'test-campaign',
        'excerpt' => 'A test campaign',
        'comment_prompt' => 'Share your thoughts',
        'content' => 'Campaign description',
        'hero_img_url' => 'https://example.com/hero.jpg',
        'amount' => 100000.0,
        'created_at' => now()->format('Y-m-d H:i:s'),
        'updated_at' => now()->format('Y-m-d H:i:s'),
        'label' => 'TC1',
        'currency' => 'ADA',
        'proposals_count' => 25,
        'unfunded_proposals_count' => 15,
        'funded_proposals_count' => 10,
        'completed_proposals_count' => 5,
        'total_requested' => 250000.0,
        'total_awarded' => 150000.0,
        'total_distributed' => 100000.0,
        'fund' => $fundData,
    ];

    $dto = CampaignData::from($data);

    expect($dto)->toBeInstanceOf(CampaignData::class)
        ->and($dto->id)->toBe($data['id'])
        ->and($dto->fund_id)->toBe($data['fund_id'])
        ->and($dto->title)->toBe('Test Campaign')
        ->and($dto->slug)->toBe('test-campaign')
        ->and($dto->amount)->toBe(100000.0)
        ->and($dto->currency)->toBe('ADA')
        ->and($dto->proposals_count)->toBe(25)
        ->and($dto->funded_proposals_count)->toBe(10)
        ->and($dto->total_requested)->toBe(250000.0)
        ->and($dto->total_awarded)->toBe(150000.0)
        ->and($dto->total_distributed)->toBe(100000.0)
        ->and($dto->fund)->toBeInstanceOf(\App\DataTransferObjects\FundData::class)
        ->and($dto->fund->title)->toBe('Fund 10');
});

it('handles date formatting in CampaignData', function () {
    $campaign = Campaign::factory()->create();
    $dto = $campaign->toDto();

    expect($dto->created_at)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->updated_at)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    );
});

it('handles label attribute in CampaignData', function () {
    $campaign = Campaign::factory()->create();
    $dto = $campaign->toDto();

    expect($dto->label)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    );
});

it('serializes CampaignData with MapInputName attributes correctly', function () {
    $campaign = Campaign::factory()->create();
    $dto = $campaign->toDto();
    $array = $dto->toArray();

    // These should be mapped to their input names
    expect($array)->toHaveKey('totalRequested')
        ->toHaveKey('totalAwarded')
        ->toHaveKey('totalDistributed');
    
    // Original property names should not exist in serialized array
    expect($array)->not->toHaveKey('total_requested')
        ->not->toHaveKey('total_awarded')
        ->not->toHaveKey('total_distributed');
});

// Type Validation Tests
it('validates CampaignData field types from factory', function () {
    $campaign = Campaign::factory()->create();
    $dto = $campaign->toDto();

    expect($dto->id)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->fund_id)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->title)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->meta_title)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->slug)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->excerpt)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->comment_prompt)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->content)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->hero_img_url)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->amount)->toSatisfy(fn($v) => is_null($v) || is_float($v) || is_int($v));
    expect($dto->created_at)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->updated_at)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->label)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->currency)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->proposals_count)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->unfunded_proposals_count)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->funded_proposals_count)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->completed_proposals_count)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->total_requested)->toSatisfy(fn($v) => is_null($v) || is_float($v) || is_int($v));
    expect($dto->total_awarded)->toSatisfy(fn($v) => is_null($v) || is_float($v) || is_int($v));
    expect($dto->total_distributed)->toSatisfy(fn($v) => is_null($v) || is_float($v) || is_int($v));
    expect($dto->fund)->toSatisfy(fn($v) => is_null($v) || $v instanceof \App\DataTransferObjects\FundData);
});

it('rejects invalid types for CampaignData numeric fields', function () {
    expect(fn() => CampaignData::from([
        'id' => 'x',
        'amount' => 'not-a-number',
        'proposals_count' => 'ten',
        'total_requested' => 'nope'
    ]))->toThrow();
});

it('accepts null values for CampaignData nullable fields', function () {
    $dto = CampaignData::from([
        'id' => null,
        'fund_id' => null,
        'title' => null,
        'meta_title' => null,
        'slug' => null,
        'excerpt' => null,
        'comment_prompt' => null,
        'content' => null,
        'hero_img_url' => null,
        'amount' => null,
        'created_at' => null,
        'updated_at' => null,
        'label' => null,
        'currency' => null,
        'proposals_count' => null,
        'unfunded_proposals_count' => null,
        'funded_proposals_count' => null,
        'completed_proposals_count' => null,
        'total_requested' => null,
        'total_awarded' => null,
        'total_distributed' => null,
        'fund' => null,
    ]);

    expect($dto->id)->toBeNull();
    expect($dto->amount)->toBeNull();
    expect($dto->proposals_count)->toBeNull();
    expect($dto->total_requested)->toBeNull();
});
