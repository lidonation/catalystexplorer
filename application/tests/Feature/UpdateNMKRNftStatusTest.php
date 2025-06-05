<?php

use App\Models\Tx;
use App\Models\Nft;
use App\Enums\StatusEnum;
use App\Jobs\UpdateNMKRNftStatus;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('processes the NMKR webhook and updates the NFT status', function () {
    // Fake the queue
    Queue::fake();

    Log::shouldReceive('info')->andReturn(null);
    Log::shouldReceive('channel')->andReturnSelf();
    Log::shouldReceive('error')->andReturn(null);
    Log::shouldReceive('warning')->andReturn(null);

    $user = \App\Models\User::factory()->create();
    
    $profile = \App\Models\IdeascaleProfile::factory()->create([
        'claimed_by_id' => $user->id,
    ]);

    $nft = Nft::factory()->create([
        'status' => 'pending',
        'model_type' => \App\Models\IdeascaleProfile::class,
        'model_id' => $profile->id,
    ]);

    // Attach meta with nmkr_nftuid to match the webhook payload
    $nft->saveMeta(
        'nmkr_nftuid',
        '0f79ae64-aad4-4dcf-9b22-xyz1234',
    );

    $nft->saveMeta(
        'nmkr_project_uid',
        '9e2d000a-ed53-4db4-819b-xyz123456',
    );

    // Define NMKR webhook payload
    $payload = [
        "EventType" => "transactionconfirmed",
        "ProjectUid" => "9e2d000a-ed53-4db4-819b-xyz123456",
        "TxHash" => "b08aad615f599c80a243882330c99d33e07f443ca1b4d043f448bfxyz1234",
        "ReceiverAddress" => "addr_test1qrqtawercjsj29xyq4kssxeru6s33y68kwmh8tj00q4vkhaeucuvwvhegqxf6ka0ewy0pallk044nnrtsj8zxyz1234",
        "Metadata" => json_encode(["example" => "metadata"]),
        "SaleDate" => "2025-04-02T07:23:29",
        "NotificationSaleNfts" => [
            [
                "NftUid" => "0f79ae64-aad4-4dcf-9b22-xyz1234",
                "PolicyId" => "9ae5eba7256cdd1f51834676dcde4f1fea491e8adbbxyz123456",
                "Count" => 1,
            ]
        ],
    ];

    // Send a fake request to the /notifications route
    $response = $this->withoutMiddleware()->postJson(route('api.nmkr'), $payload);

    // Assert response is correct
    $response->assertStatus(200)
        ->assertJson(['message' => 'Webhook processed successfully']);

    // Assert the job was dispatched with the correct payload
    Queue::assertPushed(UpdateNMKRNftStatus::class, fn($job) => $job->nmkrPayload === $payload);

    // Run the job manually (since it's queued)
    (new UpdateNMKRNftStatus($payload))->handle();

    // Assert that the NFT status was updated to 'minted'
    $nft->refresh();
    expect($nft->status)->toBe('minted');

    // Assert a transaction was recorded
    $transaction = Tx::where('model_id', $nft->id)->first();

    expect($transaction)->not->toBeNull();
    expect($transaction->policy)->toBe('9ae5eba7256cdd1f51834676dcde4f1fea491e8adbbxyz123456');
    expect($transaction->txhash)->toBe('b08aad615f599c80a243882330c99d33e07f443ca1b4d043f448bfxyz1234');
    expect($transaction->status)->toBe(StatusEnum::completed()->value);
});