<?php

use App\Models\Nft;
use App\Models\User;
use App\Models\Meta;
use App\Http\Controllers\CompletedProjectNftsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

beforeEach(function () {
    DB::beginTransaction();
});

afterEach(function () {
    DB::rollBack();
});

function createTestNft(): Nft 
{
    $user = User::factory()->create();
    
    $nft = Nft::create([
        'name' => ['en' => 'Test NFT'],
        'description' => ['en' => 'Test Description'],
        'artist_id' => $user->id,
        'model_type' => 'App\Models\IdeascaleProfile',
        'model_id' => 1,
        'status' => 'draft',
        'metadata' => [
            'yes_votes' => '1000',
            'role' => 'member'
        ],
        'policy' => 'test_policy_123',
        'fingerprint' => 'asset1test123',
        'preview_link' => 'https://example.com/preview.jpg',
        'storage_link' => 'https://example.com/storage.jpg',
    ]);

    Meta::create([
        'model_type' => Nft::class,
        'model_id' => $nft->id,
        'key' => 'nmkr_project_uid',
        'content' => '123e4567-e89b-12d3-a456-426614174000'
    ]);

    Meta::create([
        'model_type' => Nft::class,
        'model_id' => $nft->id,
        'key' => 'nmkr_nftuid',
        'content' => 'abcdef12-3456-7890-abcd-ef1234567890'
    ]);

    Meta::create([
        'model_type' => Nft::class,
        'model_id' => $nft->id,
        'key' => 'nmkr_metadata',
        'content' => json_encode([
            '721' => [
                'version' => '1.0',
                'test_policy_id' => [
                    'test_asset_name' => [
                        'projectTitle' => 'Test Project',
                        'projectCatalystCampaignName' => 'Test Campaign',
                        'role' => 'member',
                        'yesVotes' => '1000',
                        'noVotes' => '50'
                    ]
                ]
            ]
        ])
    ]);

    return $nft->fresh(['metas']);
}

function callUpdateMetadata(Nft $nft, array $meta, bool $remove = false)
{
    $request = Request::create('/test', 'PATCH', [
        'meta' => $meta,
        'remove' => $remove
    ]);

    $controller = new CompletedProjectNftsController();
    return $controller->updateMetadata($nft, $request);
}

it('can update metadata field successfully', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $nft = createTestNft();
    
    expect($nft->metas)->toHaveCount(3);
    $nmkrMeta = $nft->metas->where('key', 'nmkr_metadata')->first();
    expect($nmkrMeta)->not->toBeNull();

    $response = callUpdateMetadata($nft, [
        'key' => 'yesVotes',
        'value' => '2000'
    ]);

    expect($response)->toBeInstanceOf(\Illuminate\Http\RedirectResponse::class);

    $nft->refresh();
    $nmkrMeta = $nft->metas->where('key', 'nmkr_metadata')->first();
    $metadata = json_decode($nmkrMeta->content, true);
    
    expect($metadata['721']['test_policy_id']['test_asset_name']['yesVotes'])->toBe('2000');

    $mainMetadata = is_string($nft->metadata) ? json_decode($nft->metadata, true) : $nft->metadata;
    expect($mainMetadata['yes_votes'])->toBe('2000');
});

it('can remove metadata field successfully', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $nft = createTestNft();

    $response = callUpdateMetadata($nft, [
        'key' => 'role',
        'value' => 'member'
    ], true);

    expect($response)->toBeInstanceOf(\Illuminate\Http\RedirectResponse::class);

    $nft->refresh();
    $nmkrMeta = $nft->metas->where('key', 'nmkr_metadata')->first();
    $metadata = json_decode($nmkrMeta->content, true);
    
    expect($metadata['721']['test_policy_id']['test_asset_name'])->not->toHaveKey('role');

    $mainMetadata = is_string($nft->metadata) ? json_decode($nft->metadata, true) : $nft->metadata;
    expect($mainMetadata)->not->toHaveKey('role');
});

it('handles missing nmkr metadata gracefully', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $nft = Nft::create([
        'name' => ['en' => 'Test NFT'],
        'description' => ['en' => 'Test Description'],
        'artist_id' => $user->id,
        'model_type' => 'App\Models\IdeascaleProfile',
        'model_id' => 1,
        'status' => 'draft',
        'metadata' => ['role' => 'member'],
        'policy' => 'test_policy_123',
        'fingerprint' => 'asset1test123',
        'preview_link' => 'https://example.com/preview.jpg',
        'storage_link' => 'https://example.com/storage.jpg',
    ]);

    $nft = $nft->fresh(['metas']);
    
    $nmkrMeta = $nft->metas->where('key', 'nmkr_metadata')->first();
    expect($nmkrMeta)->toBeNull();

    $response = callUpdateMetadata($nft, [
        'key' => 'yesVotes',
        'value' => '1000'
    ]);

    expect($response)->toBeInstanceOf(\Illuminate\Http\RedirectResponse::class);
    expect($response->getStatusCode())->toBe(302);

    $session = $response->getSession();
    expect($session)->not->toBeNull();
    expect($session->has('errors'))->toBeTrue();
    
    $errors = $session->get('errors')->all();
    expect($errors)->toContain('Failed to update: No NMKR metadata found');
});

it('validates required fields', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $nft = createTestNft();

    expect(function () use ($nft) {
        $request = Request::create('/test', 'PATCH', [
            'meta' => ['value' => '1000'],
            'remove' => false
        ]);
        $controller = new CompletedProjectNftsController();
        $controller->updateMetadata($nft, $request);
    })->toThrow(\Illuminate\Validation\ValidationException::class);
});

it('maps frontend keys to backend keys correctly', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $nft = createTestNft();

    $response = callUpdateMetadata($nft, [
        'key' => 'campaignName',
        'value' => 'Test Campaign'
    ]);

    expect($response)->toBeInstanceOf(\Illuminate\Http\RedirectResponse::class);

    $nft->refresh();
    $nmkrMeta = $nft->metas->where('key', 'nmkr_metadata')->first();
    $metadata = json_decode($nmkrMeta->content, true);
    
    expect($metadata['721']['test_policy_id']['test_asset_name']['projectCatalystCampaignName'])
        ->toBe('Test Campaign');
});

it('skips api call for test nfts but updates locally', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $nft = createTestNft();

    $response = callUpdateMetadata($nft, [
        'key' => 'role',
        'value' => 'lead'
    ]);

    expect($response)->toBeInstanceOf(\Illuminate\Http\RedirectResponse::class);

    $nft->refresh();
    $nmkrMeta = $nft->metas->where('key', 'nmkr_metadata')->first();
    $metadata = json_decode($nmkrMeta->content, true);
    
    expect($metadata['721']['test_policy_id']['test_asset_name']['role'])->toBe('lead');

    $mainMetadata = is_string($nft->metadata) ? json_decode($nft->metadata, true) : $nft->metadata;
    expect($mainMetadata['role'])->toBe('lead');
});