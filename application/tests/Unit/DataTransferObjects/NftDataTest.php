<?php

declare(strict_types=1);

use App\DataTransferObjects\NftData;
use App\Models\Nft;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class);

it('converts Nft model to NftData DTO successfully', function () {
    $nft = Nft::factory()->create();

    $dto = $nft->toDto();

    expect($dto)->toBeInstanceOf(NftData::class)
        ->and($dto->id)->toBe($nft->id)
        ->and($dto->hash)->toBe($nft->hash)
        ->and($dto->user_id)->toBe($nft->user_id)
        ->and($dto->artist_id)->toBe($nft->artist_id)
        ->and($dto->model_id)->toBe($nft->model_id)
        ->and($dto->profile_hash)->toBe($nft->profile_hash)
        ->and($dto->model_type)->toBe($nft->model_type)
        ->and($dto->storage_link)->toBe($nft->storage_link)
        ->and($dto->preview_link)->toBe($nft->preview_link)
        ->and($dto->name)->toBe($nft->name)
        ->and($dto->owner_address)->toBe($nft->owner_address)
        ->and($dto->description)->toBe($nft->description)
        ->and($dto->rarity)->toBe($nft->rarity)
        ->and($dto->status)->toBe($nft->status)
        ->and($dto->fingerprint)->toBe($nft->fingerprint)
        ->and($dto->qty)->toBe($nft->qty);
});

it('serializes NftData to array correctly', function () {
    $nft = Nft::factory()->create();
    $dto = $nft->toDto();
    $array = $dto->toArray();

    expect($array)->toBeArray()
        ->toHaveKey('id', $nft->id)
        ->toHaveKey('hash', $nft->hash)
        ->toHaveKey('name', $nft->name)
        ->toHaveKey('description', $nft->description)
        ->toHaveKey('fingerprint', $nft->fingerprint)
        ->toHaveKey('storage_link', $nft->storage_link)
        ->toHaveKey('preview_link', $nft->preview_link)
        ->toHaveKey('rarity', $nft->rarity)
        ->toHaveKey('status', $nft->status)
        ->toHaveKey('qty', $nft->qty)
        ->toHaveKey('created_at')
        ->toHaveKey('updated_at')
        ->toHaveKey('minted_at')
        ->toHaveKey('metadata')
        ->toHaveKey('required_nft_metadata')
        ->toHaveKey('metas');
});

it('handles metadata relationship in NftData', function () {
    $nft = Nft::factory()->create();
    $nft->load('metadata');
    $dto = $nft->toDto();

    expect($dto->metadata)->toSatisfy(
        fn($value) => $value === null || $value instanceof \App\DataTransferObjects\NftMetaData
    );
});

it('handles required_nft_metadata relationship in NftData', function () {
    $nft = Nft::factory()->create();
    $dto = $nft->toDto();

    expect($dto->required_nft_metadata)->toSatisfy(
        fn($value) => $value === null || $value instanceof \App\DataTransferObjects\NMKRNftData
    );
});

it('handles date attributes as Carbon instances in NftData', function () {
    $nft = Nft::factory()->create();
    $dto = $nft->toDto();

    expect($dto->minted_at)->toSatisfy(
        fn($value) => $value === null || $value instanceof \Carbon\Carbon
    )->and($dto->created_at)->toSatisfy(
        fn($value) => $value === null || $value instanceof \Carbon\Carbon
    )->and($dto->updated_at)->toSatisfy(
        fn($value) => $value === null || $value instanceof \Carbon\Carbon
    )->and($dto->deleted_at)->toSatisfy(
        fn($value) => $value === null || $value instanceof \Carbon\Carbon
    );
});

it('handles metas as array or Collection in NftData', function () {
    $nft = Nft::factory()->create();
    $dto = $nft->toDto();

    expect($dto->metas)->toSatisfy(
        fn($value) => is_array($value) || $value instanceof \Illuminate\Support\Collection
    );
});

it('uses special fromArray static method correctly in NftData', function () {
    $data = [
        'id' => 1,
        'user_id' => 2,
        'artist_id' => 3,
        'model_id' => 4,
        'profile_hash' => 'profile123',
        'model_type' => 'App\Models\Proposal',
        'storage_link' => 'https://storage.example.com/nft.jpg',
        'preview_link' => 'https://preview.example.com/nft.jpg',
        'name' => 'Test NFT',
        'owner_address' => 'addr1test123',
        'description' => 'A test NFT',
        'rarity' => 'common',
        'status' => 'minted',
        'fingerprint' => 'asset1234567890abcdef',
        'metadata' => [
            'name' => 'Test NFT',
            'image' => 'https://example.com/image.jpg'
        ],
        'required_nft_metadata' => [
            'name' => 'Required NFT',
            'description' => 'Required description'
        ],
        'minted_at' => '2023-01-15 10:30:00',
        'qty' => 1,
        'created_at' => '2023-01-10 09:00:00',
        'updated_at' => '2023-01-15 10:30:00',
        'deleted_at' => null,
        'metas' => ['trait1', 'trait2'],
    ];

    $dto = NftData::fromArray($data);

    expect($dto)->toBeInstanceOf(NftData::class)
        ->and($dto->id)->toBe(1)
        ->and($dto->name)->toBe('Test NFT')
        ->and($dto->description)->toBe('A test NFT')
        ->and($dto->fingerprint)->toBe('asset1234567890abcdef')
        ->and($dto->qty)->toBe(1)
        ->and($dto->minted_at)->toBeInstanceOf(\Carbon\Carbon::class)
        ->and($dto->created_at)->toBeInstanceOf(\Carbon\Carbon::class)
        ->and($dto->updated_at)->toBeInstanceOf(\Carbon\Carbon::class)
        ->and($dto->deleted_at)->toBeNull()
        ->and($dto->metadata)->toBeInstanceOf(\App\DataTransferObjects\NftMetaData::class)
        ->and($dto->required_nft_metadata)->toBeInstanceOf(\App\DataTransferObjects\NMKRNftData::class)
        ->and($dto->metas)->toBe(['trait1', 'trait2']);
});

it('handles null metadata in fromArray method', function () {
    $data = [
        'id' => 1,
        'name' => 'Test NFT',
        'description' => 'A test NFT',
        'fingerprint' => 'asset123',
        'metadata' => null,
        'required_nft_metadata' => null,
        'minted_at' => null,
        'created_at' => null,
        'updated_at' => null,
        'deleted_at' => null,
        'metas' => [],
    ];

    $dto = NftData::fromArray($data);

    expect($dto)->toBeInstanceOf(NftData::class)
        ->and($dto->metadata)->toBeNull()
        ->and($dto->required_nft_metadata)->toBeNull()
        ->and($dto->minted_at)->toBeNull()
        ->and($dto->created_at)->toBeNull()
        ->and($dto->updated_at)->toBeNull()
        ->and($dto->deleted_at)->toBeNull()
        ->and($dto->metas)->toBe([]);
});

it('creates NftData from regular Spatie Data from method', function () {
    $data = [
        'id' => 1,
        'hash' => 'hash123',
        'user_id' => 2,
        'artist_id' => 3,
        'model_id' => 4,
        'profile_hash' => 'profile123',
        'model_type' => 'App\Models\Proposal',
        'storage_link' => 'https://storage.example.com/nft.jpg',
        'preview_link' => 'https://preview.example.com/nft.jpg',
        'name' => 'Test NFT',
        'owner_address' => 'addr1test123',
        'description' => 'A test NFT',
        'rarity' => 'common',
        'status' => 'minted',
        'fingerprint' => 'asset1234567890abcdef',
        'metadata' => null,
        'required_nft_metadata' => null,
        'minted_at' => null,
        'qty' => 1,
        'created_at' => null,
        'updated_at' => null,
        'deleted_at' => null,
        'metas' => [],
    ];

    $dto = NftData::from($data);

    expect($dto)->toBeInstanceOf(NftData::class)
        ->and($dto->id)->toBe(1)
        ->and($dto->hash)->toBe('hash123')
        ->and($dto->name)->toBe('Test NFT')
        ->and($dto->fingerprint)->toBe('asset1234567890abcdef');
});

it('handles different NFT status values', function () {
    $mintedNft = Nft::factory()->create(['status' => 'minted']);
    $pendingNft = Nft::factory()->create(['status' => 'pending']);
    $failedNft = Nft::factory()->create(['status' => 'failed']);

    $mintedDto = $mintedNft->toDto();
    $pendingDto = $pendingNft->toDto();
    $failedDto = $failedNft->toDto();

    expect($mintedDto->status)->toBe('minted')
        ->and($pendingDto->status)->toBe('pending')
        ->and($failedDto->status)->toBe('failed');
});

it('handles different NFT rarity values', function () {
    $commonNft = Nft::factory()->create(['rarity' => 'common']);
    $rareNft = Nft::factory()->create(['rarity' => 'rare']);
    $legendaryNft = Nft::factory()->create(['rarity' => 'legendary']);

    $commonDto = $commonNft->toDto();
    $rareDto = $rareNft->toDto();
    $legendaryDto = $legendaryNft->toDto();

    expect($commonDto->rarity)->toBe('common')
        ->and($rareDto->rarity)->toBe('rare')
        ->and($legendaryDto->rarity)->toBe('legendary');
});

// Type Validation Tests
it('validates NftData field types from factory', function () {
    $nft = Nft::factory()->create();
    $dto = $nft->toDto();

    expect($dto->id)->toBeInt();
    expect($dto->hash)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->qty)->toBeInt();
    expect($dto->name)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->fingerprint)->toSatisfy(fn($v) => is_null($v) || is_string($v));
    expect($dto->minted_at)->toSatisfy(fn($v) => is_null($v) || $v instanceof \Carbon\Carbon);
});

it('rejects invalid types for NftData', function () {
    expect(fn() => NftData::from([
        'id' => 1,
        'qty' => 'one'
    ]))->toThrow();
});

it('accepts null values for nullable NftData fields', function () {
    $dto = NftData::from([
        'id' => 1,
        'hash' => null,
        'name' => null,
        'fingerprint' => null,
        'minted_at' => null,
        'qty' => 1,
    ]);

    expect($dto->hash)->toBeNull();
    expect($dto->name)->toBeNull();
    expect($dto->minted_at)->toBeNull();
});
