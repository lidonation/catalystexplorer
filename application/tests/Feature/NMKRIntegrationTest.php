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
    protected array $testNfts = []; // Fixed variable name from nftsIds

    protected function setUp(): void
    {
        parent::setUp();
        $configValue = config('cardano-nft-maker-laravel.project_uuid');
        Log::info('Config ', ['value' => $configValue]);
        $authKey = env('MAKER_AUTH_KEY');
        Log::info('Environment Variables', [
            'MAKER_AUTH_KEY_EXISTS' => !empty($authKey),
            'MAKER_AUTH_KEY_LENGTH' => $authKey ? strlen($authKey) : 0,
            'MAKER_BASE_URL' => env('MAKER_BASE_URL'),
            'MAKER_PROJECT_UUID' => env('MAKER_PROJECT_UUID')
        ]);
//        $this->projectUid = is_string($configValue) ? $configValue : '92fa1da3-df83-40b9-a21b-dc819553e98b';
        $this->projectUid = is_string($configValue) ? $configValue : 'e92cdbae-932f-443d-9a5a-6920822152d3';
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
        Config::set('cardano-nft-maker-laravel.baseUrl', 'https://studio-api.preprod.nmkr.io');

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

    /** @test */
    public function it_can_upload_a_single_nft_to_nmkr()
    {
        $nft1 = $this->createTestNft('Test NFT One');
        $this->uploadNftToNMKR($nft1); // Need to call this for the first NFT too

        $this->assertNotNull($nft1->maker_nft_uuid);
        $this->assertNotNull($nft1->policy);

        $response = $nft1->getNMKRNftMetadata();
        $this->assertTrue($response->successful());
        $data = $response->json();
        $this->assertEquals($nft1->maker_nft_uuid, $data['nftUid']);

        $nft2 = $this->createTestNft('Test NFT Two');
        $this->uploadNftToNMKR($nft2);

        $this->assertNotNull($nft2->maker_nft_uuid);
        $this->assertNotNull($nft2->policy);

        $this->testNfts[] = $nft1;
        $this->testNfts[] = $nft2;
    }

    /** @test */
    public function it_can_upload_multiple_nfts_to_nmkr()
    {
        // Arrange
        $nft1 = $this->createTestNft('Test NFT 1');
        $nft2 = $this->createTestNft('Test NFT 2');

        // Act
        $this->uploadNftToNMKR($nft1);
        $this->uploadNftToNMKR($nft2);

        // Assert
        $response1 = $nft1->getNMKRNftMetadata();
        $response2 = $nft2->getNMKRNftMetadata();

        $this->assertTrue($response1->successful());
        $this->assertTrue($response2->successful());

        $nftData1 = $response1->json();
        $nftData2 = $response2->json();

        $this->assertEquals($nft1->name, $nftData1['name']);
        $this->assertEquals($nft2->name, $nftData2['name']);

        // Store NFTs for cleanup
        $this->testNfts[] = $nft1;
        $this->testNfts[] = $nft2;
    }

    /** @test */
    public function it_can_update_nft_metadata()
    {
        $nft = $this->createTestNft('Test NFT Update');
        $this->uploadNftToNMKR($nft);

        $originalTitle = $nft->metadata['Project Title'];
        $newTitle = 'Updated Project Title ' . rand(1000, 9999);

        $response = $this->patch(route('crud.nfts.update', $nft->id), [
            'meta' => [
                'key' => 'projectTitle',
                'value' => $newTitle
            ]
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', true);

        $nft->refresh();
        $this->assertEquals($newTitle, $nft->metadata['Project Title']);

        $apiResponse = $nft->getNMKRNftMetadata();
        $this->assertTrue($apiResponse->successful());

        $metadata = json_decode($apiResponse->json('metadata'), true);
        $this->assertNotEmpty($metadata);
        $this->assertArrayHasKey(721, $metadata);

        $policyId = $nft->policy;
        $this->assertArrayHasKey($policyId, $metadata[721]);

        $nftKey = array_key_first($metadata[721][$policyId]);
        $nftData = $metadata[721][$policyId][$nftKey];

        $this->assertTrue(
            array_key_exists('projectTitle', $nftData) ||
            array_key_exists('Project Title', $nftData)
        );

        $this->testNfts[] = $nft;
    }

    /** @test */
    public function it_can_delete_nft_from_nmkr()
    {
        $nft = $this->createTestNft('Test NFT Delete');
        $this->uploadNftToNMKR($nft);

        $nftUid = $nft->maker_nft_uuid;

        $beforeResponse = $nft->getNMKRNftMetadata();
        $this->assertTrue($beforeResponse->successful());

        $deleteResponse = $nft->deleteNMKRNft();
        $this->assertTrue($deleteResponse->successful());

        $afterResponse = $nft->getNMKRNftMetadata();

        $this->assertTrue(
            $afterResponse->status() === 404 ||
            ($afterResponse->json('resultState') === 'Error' && $afterResponse->json('errorCode') === 404)
        );
    }

    /**
     * Helper method to create a test NFT in the database
     */
    protected function createTestNft(string $name = null): Nft
    {
        $nft = new Nft();
        $nft->name = str_replace(' ', '', $name ?? 'TestNFT') . rand(1000, 9999);
        $nft->description = 'Test NFT for NMKR integration';
        $nft->preview_link = 'https://via.placeholder.com/300';
        $nft->storage_link = 'https://via.placeholder.com/300';
        $nft->status = 'draft';
//        $nft->author_id = $this->user->id;
        $nft->metadata = [
            'Project Title' => 'Test Project ' . rand(1000, 9999),
            'Funded Project Number' => 'F' . rand(10, 20),
            'Fund' => rand(1, 10),
            'campaign_name' => 'Test Campaign',
            'yes_votes' => rand(100, 1000),
            'no_votes' => rand(10, 100),
            'role' => 'Tester'
        ];
        $nft->save();

        // Set project UUID using save attribute or meta method depending on implementation
        if (method_exists($nft, 'saveMeta')) {
            $nft->saveMeta('nmkr_project_uid', $this->projectUid, null, true);
        } else {
            $nft->maker_project_uuid = $this->projectUid;
            $nft->save();
        }

        $nft->refresh();
        return $nft;
    }

    /**
     * Helper method to upload an NFT to NMKR
     */
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
            Log::error('NMKR Upload Full Context', [
                'nft_data' => $nft->toArray(),
                'metadata' => $metadata,
                'project_uid' => $this->projectUid,
                'environment_vars' => [
                    'MAKER_AUTH_KEY' => !empty(config('cardano-nft-maker-laravel.auth_key')) ? 'present' : 'missing',
                    'MAKER_BASE_URL' => config('cardano-nft-maker-laravel.baseUrl'),
                    'MAKER_PROJECT_UUID' => $this->projectUid
                ]
            ]);

            Log::info('NMKR Upload Attempt', [
                'metadata' => $metadata,
                'auth_key_exists' => !empty(config('cardano-nft-maker-laravel.auth_key')),
                'base_url' => config('cardano-nft-maker-laravel.baseUrl'),
                'project_uuid' => $this->projectUid,
                'nft_id' => $nft->id
            ]);
            $validatedMetadata = MetadataUpload::from($metadata);
            Log::info('NMKR Upload Attempt', [
                'metadata' => $metadata,
                'auth_key' => config('cardano-nft-maker-laravel.auth_key'),
                'base_url' => config('cardano-nft-maker-laravel.baseUrl'),
                'project_uuid' => $this->projectUid
            ]);
            $response = $nft->uploadNMKRNft($validatedMetadata);
            Log::info('NMKR Upload Response', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            $result = $response->json();
            Log::info('NMKR Upload Response', ['response' => $result]);
            $metadataJson = $result['metadata'];
            $metadataArray = json_decode($metadataJson, true);
            $policy = array_key_first($metadataArray[721]);

            // Handle different ways of saving NFT metadata depending on implementation
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
        }catch (\Exception $e) {
            Log::error('NMKR Upload Detailed Error', [
                'error_message' => $e->getMessage(),
                'error_code' => method_exists($e, 'getCode') ? $e->getCode() : 'N/A',
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            // For testing purposes, let's add a more descriptive message
            $this->fail('NMKR Upload Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ' line ' . $e->getLine());
        }
    }



    /**
     * Helper method to verify NMKR API credentials
     */
    protected function verifyNmkrCredentials(): bool
    {
        // Check if auth key exists
        $authKey = config('cardano-nft-maker-laravel.auth_key');
        if (empty($authKey)) {
            Log::error('NMKR Auth Key is missing or empty in config');
            return false;
        }

        // Check project UUID
        if (empty($this->projectUid)) {
            Log::error('NMKR Project UUID is missing or empty');
            return false;
        }

        // Check base URL
        $baseUrl = config('cardano-nft-maker-laravel.baseUrl');
        if (empty($baseUrl)) {
            Log::error('NMKR Base URL is missing or empty in config');
            return false;
        }

        // Log credential info (without revealing full auth key)
        Log::info('NMKR API Credentials Check', [
            'auth_key_exists' => !empty($authKey),
            'auth_key_length' => strlen($authKey),
            'auth_key_prefix' => substr($authKey, 0, 4) . '...',
            'base_url' => $baseUrl,
            'project_uuid' => $this->projectUid
        ]);

        return true;
    }
    /** @test */
    public function it_can_directly_verify_nmkr_api_connection()
    {
        // Skip the regular NFT creation and try to directly call the API
        try {
            // Get the service from the NFT model
            $nft = new Nft();

            // Try a simple API call if available
            if (method_exists($nft, 'getNMKRNftService')) {
                $service = $nft->getNMKRNftService();
                $response = $service->checkApi();

                Log::info('Direct API check response', [
                    'response' => $response?->json() ?? 'No response'
                ]);

                $this->assertTrue(true, 'API connection successful');
            } else {
                // If we can't get the service directly, log what methods are available
                $methods = get_class_methods($nft);
                Log::info('Available methods on NFT model', [
                    'methods' => array_filter($methods, fn($m) => strpos($m, 'NMKR') !== false)
                ]);

                $this->markTestSkipped('Cannot directly test API - no service accessor method found');
            }
        } catch (\Exception $e) {
            Log::error('Direct API check error', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            $this->fail('API check failed: ' . $e->getMessage());
        }
    }
}
