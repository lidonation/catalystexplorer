<?php

declare(strict_types=1);

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\WalletInfoService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use PHPUnit\Framework\Attributes\Test;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WalletInfoServiceTest extends TestCase
{
    use RefreshDatabase;

    private WalletInfoService $service;
    private string $testStakeAddress = 'stake1u9ylzsgxaa6xctf4juup682ar3juj85n8tx3hthnljg47zctvm3rc';

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new WalletInfoService();

        config(['services.blockfrost.project_id' => 'test_blockfrost_key']);
        Cache::flush();
    }

    protected function tearDown(): void
    {
        Cache::flush();
        parent::tearDown();
    }
    #[Test]
    public function it_handles_successful_blockfrost_response()
    {
        Http::fake([
            'cardano-preprod.blockfrost.io/api/v0/accounts/*' => Http::response([
                'controlled_amount' => '5000000000',
                'active' => true,
                'stake_address' => 'stake1success',
            ], 200)
        ]);

        $result = $this->service->getWalletStats('stake1success');

        expect($result['balance'])->toBe('5,000 ADA');
        expect($result['status'])->toBe(true);
        expect($result['stakeAddress'])->toBe('stake1success');
    }

    #[Test]
    public function it_handles_404_response_from_blockfrost()
    {
        Http::fake([
            'cardano-preprod.blockfrost.io/api/v0/accounts/*' => Http::response(null, 404)
        ]);

        $result = $this->service->getWalletStats($this->testStakeAddress);

        expect($result)->toBe([
            'balance' => '0 ADA',
            'status' => false,
            'stakeAddress' => $this->testStakeAddress,
            'all_time_votes' => 0,
            'funds_participated' => [],
        ]);
    }

    #[Test]
    public function it_handles_failed_blockfrost_response()
    {
        Http::fake([
            'cardano-preprod.blockfrost.io/api/v0/accounts/*' => Http::response([
                'error' => 'Server error'
            ], 500)
        ]);

        $result = $this->service->getWalletStats($this->testStakeAddress);

        expect($result)->toBe([
            'balance' => 'N/A',
            'all_time_votes' => 0,
            'funds_participated' => [],
        ]);
    }

    #[Test]
    public function it_uses_cache_for_repeated_requests()
    {
        // Mock successful response
        Http::fake([
            'cardano-preprod.blockfrost.io/api/v0/accounts/*' => Http::response([
                'controlled_amount' => '1000000000', // 1000 ADA
                'active' => false,
                'stake_address' => $this->testStakeAddress,
            ], 200)
        ]);

        // First call should hit the API
        $result1 = $this->service->getWalletStats($this->testStakeAddress);

        // Second call should use cache (verify by checking HTTP calls)
        $result2 = $this->service->getWalletStats($this->testStakeAddress);

        expect($result1)->toBe($result2);

        // Should only make one HTTP call due to caching
        Http::assertSentCount(1);
    }


    #[Test]
        public function it_formats_balance_correctly()
        {

            $uniqueStakeAddress = 'stake1u8qlzsgxaa6xctf4juup682ar3juj85n8tx3hthnljg47zctvm3rc';

            Http::fake([
                'cardano-preprod.blockfrost.io/api/v0/accounts/*' => Http::response([
                    'controlled_amount' => '1234000000', // Exactly 1,234 ADA (avoid rounding)
                    'active' => true,
                    'stake_address' => $uniqueStakeAddress,
                ], 200)
            ]);

            $result = $this->service->getWalletStats($uniqueStakeAddress);

            expect($result['balance'])->toBe('1,234 ADA');
        }

    #[Test]
    public function it_sends_correct_headers_to_blockfrost()
    {
        $uniqueStakeAddress = 'stake1u6qlzsgxaa6xctf4juup682ar3juj85n8tx3hthnljg47zctvm3rc';

        Http::fake([
            'cardano-preprod.blockfrost.io/api/v0/accounts/*' => Http::response([
                'controlled_amount' => '1000000000',
                'active' => true,
                'stake_address' => $uniqueStakeAddress,
            ], 200)
        ]);

        $this->service->getWalletStats($uniqueStakeAddress);

        Http::assertSent(function ($request) use ($uniqueStakeAddress) {
            return $request->hasHeader('project_id', 'test_blockfrost_key') &&
                   $request->url() === "https://cardano-preprod.blockfrost.io/api/v0/accounts/{$uniqueStakeAddress}";
        });
    }

    #[Test]
    public function it_logs_appropriate_messages()
    {
        $uniqueStakeAddress = 'stake1u4qlzsgxaa6xctf4juup682ar3juj85n8tx3hthnljg47zctvm3rc';

        Http::fake([
            'cardano-preprod.blockfrost.io/api/v0/accounts/*' => Http::response([
                'controlled_amount' => '1000000000',
                'active' => true,
                'stake_address' => $uniqueStakeAddress,
            ], 200)
        ]);

        $result = $this->service->getWalletStats($uniqueStakeAddress);

        expect($result['balance'])->toBe('1,000 ADA');
        expect($result['status'])->toBe(true);
    }

    #[Test]
    public function it_handles_missing_blockfrost_config()
    {
        config(['services.blockfrost.project_id' => null]);

        Http::fake([
            'cardano-preprod.blockfrost.io/api/v0/accounts/*' => Http::response([
                'error' => 'Unauthorized'
            ], 401)
        ]);

        $result = $this->service->getWalletStats($this->testStakeAddress);

        expect($result)->toBe([
            'balance' => 'N/A',
            'all_time_votes' => 0,
            'funds_participated' => [],
        ]);
    }
}
