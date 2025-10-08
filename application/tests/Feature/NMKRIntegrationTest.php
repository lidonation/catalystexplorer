<?php

declare(strict_types=1);

use App\Models\Nft;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Lidonation\CardanoNftMaker\DTO\MetadataUpload;
use Tests\TestCase;

class NMKRIntegrationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected string $projectUid;
    protected array $testNfts = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->projectUid = config('cardano-nft-maker-laravel.project_uuid');
        Config::set('cardano-nft-maker-laravel.baseUrl', 'https://studio-api.preprod.nmkr.io');
        Config::set('cardano-nft-maker-laravel.auth_key', env('MAKER_AUTH_KEY'));

        $this->user = User::factory()->create();
        $this->actingAs($this->user);


        $credentialsValid = $this->verifyNmkrCredentials();
        if (!$credentialsValid) {
            $this->markTestSkipped('NMKR API credentials are invalid or missing');
        }
    }

    protected function tearDown(): void
    {
        foreach ($this->testNfts as $nft) {
            try {
                $nft->deleteNMKRNft();
            } catch (\Exception $e) {
                Log::error("Failed to delete test NFT {$nft->id}: " . $e->getMessage());
            }
        }
        parent::tearDown();
    }

    public function test_can_upload_a_single_nft_to_nmkr()
    {
        $nft1 = $this->createTestNft('Test NFT One');
        $this->uploadNftToNMKR($nft1);

        $this->assertNotNull($nft1->maker_nft_uuid);
        $this->assertNotNull($nft1->policy);

        $response = $nft1->getNMKRNftMetadata();
        $this->assertTrue($response->successful());
        $data = $response->json();
        $this->assertEquals($nft1->maker_nft_uuid, $data['uid']);

        $nft2 = $this->createTestNft('Test NFT Two');
        $this->uploadNftToNMKR($nft2);

        $this->testNfts[] = $nft1;
    }

    public function test_can_upload_multiple_nfts_to_nmkr()
    {
        $nft1 = $this->createTestNft('Test NFT 1');
        $nft2 = $this->createTestNft('Test NFT 2');

        $this->uploadNftToNMKR($nft1);
        $this->uploadNftToNMKR($nft2);

        $response1 = $nft1->getNMKRNftMetadata();
        $response2 = $nft2->getNMKRNftMetadata();

        $this->assertTrue($response1->successful());
        $this->assertTrue($response2->successful());

        $nftData1 = $response1->json();
        $nftData2 = $response2->json();

        $this->assertEquals($nft1->name, $nftData1['name']);
        $this->assertEquals($nft2->name, $nftData2['name']);

        $this->testNfts[] = $nft1;
        $this->testNfts[] = $nft2;
    }

    public function test_can_update_nft_metadata()
    {
        $nft = $this->createTestNft('Original NFT Name');
        $this->uploadNftToNMKR($nft);

        $this->assertNotNull($nft->maker_nft_uuid);

        $originalResponse = $nft->getNMKRNftMetadata();
        $this->assertTrue($originalResponse->successful());
        $originalData = $originalResponse->json();
        $this->assertEquals($nft->name, $originalData['name']);

        $updatedName = 'Updated NFT Name';
        $updatedDescription = 'This is an updated description';

        $metadata = [
            '721' => [
                $nft->policy => [
                    $nft->name => [
                        "name" => $updatedName,
                        "description" => $updatedDescription,
                        "image" => "ipfs://QmQfXRk7gy2WYx5y23XRb6CLZwF3LRoiSQ2vr2DY9oLPYJ",
                        "mediaType" => "image/png"
                    ]
                ],
                "version" => "1.0"
            ]
        ];

        $updateResponse = $nft->updateNMKRNft($metadata);

        if (!$updateResponse->successful()) {
            $this->fail('Update failed: ' . $updateResponse->body());
        }

        $this->assertTrue($updateResponse->successful(), 'Update API call was not successful');

        $newResponse = $nft->getNMKRNftMetadata();
        $this->assertTrue($newResponse->successful());
        $this->assertEquals(200, $newResponse->status());

        $this->testNfts[] = $nft;
    }

    public function test_can_delete_nft()
    {
        $nft = $this->createTestNft('NFT To Delete');
        $this->uploadNftToNMKR($nft);

        $this->assertNotNull($nft->maker_nft_uuid);

        $response = $nft->getNMKRNftMetadata();
        $this->assertTrue($response->successful());

        $deleteResponse = $nft->deleteNMKRNft();
        $this->assertTrue($deleteResponse->successful(), 'Delete API call was not successful');

        $this->assertEquals(200, $deleteResponse->status());
        $this->assertEquals('', $deleteResponse->body());
    }

    protected function createTestNft(string $name = null): Nft
    {
        $nft = new Nft();
        $nft->name = str_replace(' ', '', $name ?? 'TestNFT') . random_int(1000, 9999);
        $nft->description = 'Test NFT for NMKR integration';
        $nft->preview_link = 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg';;
        $nft->storage_link = 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg';;
        $nft->status = 'draft';
        $nft->metadata = [
            'Project Title' => 'Test Project ' . random_int(1000, 9999),
            'Funded Project Number' => 'F' . random_int(10, 20),
            'Fund' => random_int(1, 10),
            'campaign_name' => 'Test Campaign',
            'yes_votes' => random_int(100, 1000),
            'no_votes' => random_int(10, 100),
            'role' => 'Tester'
        ];
        $nft->save();

        if (method_exists($nft, 'saveMeta')) {
            $nft->saveMeta('nmkr_project_uid', $this->projectUid, null, true);
        } else {
            $nft->maker_project_uuid = $this->projectUid;
            $nft->save();
        }

        $nft->refresh();
        return $nft;
    }

    protected function uploadNftToNMKR(Nft $nft)
    {
        try {
            $metadata = [
                'tokenname' => $nft->name,
                'displayname' => "Project Catalyst Completion NFT: {$nft->metadata['Funded Project Number']}",
                'description' => $nft->description,
                'previewImageNft' => [
                    'mimetype' => 'image/png',
                    'fileFromsUrl' => $nft->preview_link,
                ],
                'metadataPlaceholder' => collect($nft->metadata)->map(function ($value, $key) {
                    return [
                        'name' => Str::snake($key),
                        'value' => is_array($value) ? json_encode($value) : (string) $value,
                    ];
                })->values()->toArray(),
            ];

            $validatedMetadata = MetadataUpload::from($metadata);
            $response = $nft->uploadNMKRNft($validatedMetadata);

            $result = $response->json();
            $metadataJson = $result['metadata'];
            $metadataArray = json_decode($metadataJson, true);
            $policy = array_key_first($metadataArray[721]);

            if (method_exists($nft, 'saveMeta')) {
                $nft->saveMeta('nmkr_nftuid', $result['nftUid'], null, true);
                $nft->update(['policy' => $policy]);
            } else {
                $nft->update([
                    'maker_nft_uuid' => $result['nftUid'],
                    'policy' => $policy,
                ]);
            }

            $nft->refresh();
            return $response;
        } catch (\Exception $e) {
            $this->fail('NMKR Upload Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ' line ' . $e->getLine());
        }
    }

    protected function verifyNmkrCredentials(): bool
    {
        $authKey = config('cardano-nft-maker-laravel.auth_key');
        if (empty($authKey)) {
            return false;
        }

        if (empty($this->projectUid)) {
            return false;
        }

        $baseUrl = config('cardano-nft-maker-laravel.baseUrl');
        if (empty($baseUrl)) {
            return false;
        }

        try {
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => "{$baseUrl}/v2/GetNfts/{$this->projectUid}/all/10/1",
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'Accept: application/json',
                    'Authorization: Bearer ' . $authKey
                ],
            ]);

            $response = curl_exec($ch);
            $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            return $status >= 200 && $status < 300;
        } catch (\Exception $e) {
            return false;
        }
    }
}
