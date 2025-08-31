<?php

declare(strict_types=1);

use App\DataTransferObjects\ProposalData;
use App\Models\Proposal;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class);

it('converts Proposal model to ProposalData DTO successfully', function () {
    $proposal = Proposal::factory()->create();

    $dto = $proposal->toDto();

    expect($dto)->toBeInstanceOf(ProposalData::class)
        ->and($dto->id)->toBe($proposal->id)
        ->and($dto->title)->toBe($proposal->title)
        ->and($dto->slug)->toBe($proposal->slug)
        ->and($dto->website)->toBe($proposal->website)
        ->and($dto->excerpt)->toBe($proposal->excerpt)
        ->and($dto->amount_requested)->toBe($proposal->amount_requested)
        ->and($dto->amount_received)->toBe($proposal->amount_received)
        ->and($dto->status)->toBe($proposal->status)
        ->and($dto->funding_status)->toBe($proposal->funding_status);
});

it('serializes ProposalData to array correctly', function () {
    $proposal = Proposal::factory()->create();
    $dto = $proposal->toDto();
    $array = $dto->toArray();

    expect($array)->toBeArray()
        ->toHaveKey('id', $proposal->id)
        ->toHaveKey('title', $proposal->title)
        ->toHaveKey('slug', $proposal->slug)
        ->toHaveKey('status', $proposal->status)
        ->toHaveKey('amount_requested')
        ->toHaveKey('amount_received')
        ->toHaveKey('link')
        ->toHaveKey('campaign')
        ->toHaveKey('fund')
        ->toHaveKey('users')
        ->toHaveKey('reviews');
});

it('handles campaign relationship in ProposalData', function () {
    $proposal = Proposal::factory()->create();
    $proposal->load('campaign');
    $dto = $proposal->toDto();

    expect($dto->campaign)->toSatisfy(
        fn($value) => $value === null || $value instanceof \App\DataTransferObjects\CampaignData
    );
});

it('handles fund relationship in ProposalData', function () {
    $proposal = Proposal::factory()->create();
    $proposal->load('fund');
    $dto = $proposal->toDto();

    expect($dto->fund)->toSatisfy(
        fn($value) => $value === null || $value instanceof \App\DataTransferObjects\FundData
    );
});

it('handles schedule relationship in ProposalData', function () {
    $proposal = Proposal::factory()->create();
    $proposal->load('schedule');
    $dto = $proposal->toDto();

    expect($dto->schedule)->toSatisfy(
        fn($value) => $value === null || $value instanceof \App\DataTransferObjects\ProjectScheduleData
    );
});

it('handles users DataCollection in ProposalData', function () {
    $proposal = Proposal::factory()->create();
    $proposal->load('users');
    $dto = $proposal->toDto();

    expect($dto->users)->toSatisfy(
        fn($value) => $value === null || $value instanceof \Spatie\LaravelData\DataCollection
    );
});

it('handles reviews DataCollection in ProposalData', function () {
    $proposal = Proposal::factory()->create();
    $proposal->load('reviews');
    $dto = $proposal->toDto();

    expect($dto->reviews)->toSatisfy(
        fn($value) => $value === null || $value instanceof \Spatie\LaravelData\DataCollection
    );
});

it('handles voting counts in ProposalData', function () {
    $proposal = Proposal::factory()->create();
    $dto = $proposal->toDto();

    expect($dto->yes_votes_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->no_votes_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->abstain_votes_count)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    );
});

it('handles scoring attributes in ProposalData', function () {
    $proposal = Proposal::factory()->create();
    $dto = $proposal->toDto();

    expect($dto->ranking_total)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->alignment_score)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->feasibility_score)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    )->and($dto->auditability_score)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    );
});

it('handles content as string or array in ProposalData', function () {
    $proposal = Proposal::factory()->create();
    $dto = $proposal->toDto();

    expect($dto->content)->toSatisfy(
        fn($value) => $value === null || is_string($value) || is_array($value)
    );
});

it('handles quickpitch attributes in ProposalData', function () {
    $proposal = Proposal::factory()->create();
    $dto = $proposal->toDto();

    expect($dto->quickpitch)->toSatisfy(
        fn($value) => $value === null || is_string($value)
    )->and($dto->quickpitch_length)->toSatisfy(
        fn($value) => $value === null || is_int($value)
    );
});

it('creates ProposalData from array data', function () {
    $data = [
        'id' => fake()->uuid(),
        'campaign' => null,
        'schedule' => null,
        'title' => 'Test Proposal',
        'slug' => 'test-proposal',
        'website' => 'https://example.com',
        'excerpt' => 'Test excerpt',
        'content' => 'Test content',
        'amount_requested' => 5000.0,
        'amount_received' => 3000.0,
        'definition_of_success' => 'Success definition',
        'status' => 'active',
        'funding_status' => 'funded',
        'funded_at' => null,
        'deleted_at' => null,
        'funding_updated_at' => null,
        'yes_votes_count' => 10,
        'no_votes_count' => 5,
        'abstain_votes_count' => 2,
        'comment_prompt' => null,
        'social_excerpt' => null,
        'ideascale_link' => null,
        'projectcatalyst_io_link' => null,
        'type' => 'proposal',
        'meta_title' => null,
        'problem' => 'Test problem',
        'solution' => 'Test solution',
        'experience' => 'Test experience',
        'currency' => 'ADA',
        'minted_nfts_fingerprint' => null,
        'ranking_total' => 85,
        'alignment_score' => 90,
        'feasibility_score' => 80,
        'auditability_score' => 85,
        'quickpitch' => null,
        'quickpitch_length' => null,
        'users' => null,
        'reviews' => null,
        'fund' => null,
        'opensource' => true,
        'link' => 'https://example.com/proposal',
        'order' => 1,
    ];

    $dto = ProposalData::from($data);

    expect($dto)->toBeInstanceOf(ProposalData::class)
        ->and($dto->id)->toBe($data['id'])
        ->and($dto->title)->toBe('Test Proposal')
        ->and($dto->slug)->toBe('test-proposal')
        ->and($dto->amount_requested)->toBe(5000.0)
        ->and($dto->amount_received)->toBe(3000.0)
        ->and($dto->status)->toBe('active')
        ->and($dto->funding_status)->toBe('funded')
        ->and($dto->currency)->toBe('ADA')
        ->and($dto->opensource)->toBeTrue()
        ->and($dto->ranking_total)->toBe(85);
});

it('handles minted NFTs fingerprint array in ProposalData', function () {
    $proposal = Proposal::factory()->create();
    $dto = $proposal->toDto();

    expect($dto->minted_nfts_fingerprint)->toSatisfy(
        fn($value) => $value === null || is_array($value)
    );
});

it('handles link attribute in ProposalData', function () {
    $proposal = Proposal::factory()->create();
    $dto = $proposal->toDto();

    expect($dto->link)->toBeString();
});

// Type Validation Tests
it('validates ProposalData field types from factory', function () {
    $proposal = Proposal::factory()->create();
    $dto = $proposal->toDto();

    expect($dto->id)->toBeString();
    expect($dto->title)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->slug)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->website)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->excerpt)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->content)->toSatisfy(fn($v) => is_null($v) || is_string($v) || is_array($v));
    expect($dto->amount_requested)->toSatisfy(fn($v) => is_null($v) || is_float($v) || is_int($v));
    expect($dto->amount_received)->toSatisfy(fn($v) => is_null($v) || is_float($v) || is_int($v));
    expect($dto->yes_votes_count)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->no_votes_count)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->abstain_votes_count)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->ranking_total)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->alignment_score)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->feasibility_score)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->auditability_score)->toSatisfy(fn($v) => is_null($v) || is_int($v));
    expect($dto->opensource)->toSatisfy(fn($v) => is_null($v) || is_bool($v));
    expect($dto->order)->toSatisfy(fn($v) => is_null($v) || is_int($v));
});

it('rejects invalid types for ProposalData numeric and boolean fields', function () {
    expect(fn() => ProposalData::from([
        'id' => 'x',
        'amount_requested' => 'nope',
        'yes_votes_count' => 'ten',
        'opensource' => 'true',
        'link' => 'https://example.com' // required field
    ]))->toThrow();
});

it('accepts null values for ProposalData nullable fields', function () {
    $dto = ProposalData::from([
        'id' => 'id-1',
        'campaign' => null,
        'schedule' => null,
        'title' => null,
        'slug' => null,
        'website' => null,
        'excerpt' => null,
        'content' => null,
        'amount_requested' => null,
        'amount_received' => null,
        'definition_of_success' => null,
        'status' => null,
        'funding_status' => null,
        'funded_at' => null,
        'deleted_at' => null,
        'funding_updated_at' => null,
        'yes_votes_count' => null,
        'no_votes_count' => null,
        'abstain_votes_count' => null,
        'comment_prompt' => null,
        'social_excerpt' => null,
        'ideascale_link' => null,
        'projectcatalyst_io_link' => null,
        'type' => null,
        'meta_title' => null,
        'problem' => null,
        'solution' => null,
        'experience' => null,
        'currency' => null,
        'minted_nfts_fingerprint' => null,
        'ranking_total' => null,
        'alignment_score' => null,
        'feasibility_score' => null,
        'auditability_score' => null,
        'quickpitch' => null,
        'quickpitch_length' => null,
        'users' => null,
        'reviews' => null,
        'fund' => null,
        'opensource' => null,
        'link' => 'https://example.com',
        'order' => null,
    ]);

    expect($dto->amount_requested)->toBeNull();
    expect($dto->yes_votes_count)->toBeNull();
    expect($dto->opensource)->toBeNull();
});
