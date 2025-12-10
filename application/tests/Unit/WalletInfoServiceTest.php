<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Http\Integrations\LidoNation\Blockfrost\BlockfrostConnector;
use App\Services\WalletInfoService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class WalletInfoServiceTest extends TestCase
{
    use RefreshDatabase;

    private string $testStakeAddress = 'stake1u9ylzsgxaa6xctf4juup682ar3juj85n8tx3hthnljg47zctvm3rc';

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.blockfrost.project_id' => 'test_blockfrost_key']);
        Cache::flush();
    }

    protected function tearDown(): void
    {
        Cache::flush();
        Mockery::close();
        parent::tearDown();
    }

    private function mockServiceWithResponse(
        array $accountResponseData,
        array $addressResponseData = [],
        ?\Closure $assertRequest = null
    ): WalletInfoService {
        $mockAccountResponse = Mockery::mock(\Saloon\Http\Response::class);
        $mockAccountResponse->shouldReceive('json')->andReturn($accountResponseData);

        $mockAddressesResponse = Mockery::mock(\Saloon\Http\Response::class);
        $mockAddressesResponse->shouldReceive('json')->andReturn($addressResponseData);

        $mockConnector = Mockery::mock(BlockfrostConnector::class);

        $mockConnector->shouldReceive('send')->times(2)->andReturnUsing(function ($request) use (
            $mockAccountResponse,
            $mockAddressesResponse,
            $assertRequest
        ) {
            if ($assertRequest !== null) {
                if (! $assertRequest($request)) {
                    throw new \Exception('Header assertion failed.');
                }
            }
            if (str_contains($request->resolveEndpoint(), '/addresses')) {
                return $mockAddressesResponse;
            }

            return $mockAccountResponse;
        });

        return new WalletInfoService($mockConnector);
    }




    #[Test]
    public function it_handles_successful_blockfrost_response()
    {
        $stakeAddress = 'stake1success';

        $service = $this->mockServiceWithResponse(
            [
                'controlled_amount' => '5000000000',
                'active' => true,
                'stake_address' => $stakeAddress,
            ],
            [
                ['address' => 'addr_test1q...']
            ]
        );

        $result = $service->getWalletStats($stakeAddress);

        expect($result['balance'])->toBe('5,000.00 ADA');
        expect($result['stakeAddress'])->toBe($stakeAddress);
        expect($result['payment_addresses'])->toBe(['addr_test1q...']);
    }


    #[Test]
    public function it_handles_404_response_from_blockfrost()
    {
        $service = $this->mockServiceWithResponse([]);

        $result = $service->getWalletStats($this->testStakeAddress);

        expect($result)->toMatchArray([
            'balance' => '0.00 ADA',
            'status' => false,
            'stakeAddress' => $this->testStakeAddress,
            'all_time_votes' => 0,
            'funds_participated' => [],
            'payment_addresses' => [],
            'choice_stats' => [],
        ]);
    }

    #[Test]
    public function it_handles_failed_blockfrost_response()
    {
        $service = $this->mockServiceWithResponse([]);

        $result = $service->getWalletStats($this->testStakeAddress);

        expect($result)->toMatchArray([
            'balance' => '0.00 ADA',
            'all_time_votes' => 0,
            'funds_participated' => [],
            'payment_addresses' => [],
        ]);
    }

    #[Test]
    public function it_uses_cache_for_repeated_requests()
    {
        $service = $this->mockServiceWithResponse([
            'controlled_amount' => '1000000000',
            'active' => false,
            'stake_address' => $this->testStakeAddress,
        ]);

        $result1 = $service->getWalletStats($this->testStakeAddress);
        $result2 = $service->getWalletStats($this->testStakeAddress);

        expect($result1)->toBe($result2);
    }

    #[Test]
    public function it_formats_balance_correctly()
    {
        $stakeAddress = 'stake1u8q...';

        $service = $this->mockServiceWithResponse([
            'controlled_amount' => '1234000000',
            'active' => true,
            'stake_address' => $stakeAddress,
        ]);

        $result = $service->getWalletStats($stakeAddress);

        expect($result['balance'])->toBe('1,234.00 ADA');
    }

    #[Test]
    public function it_logs_appropriate_messages()
    {
        $stakeAddress = 'stake1logcheck';

        $service = $this->mockServiceWithResponse([
            'controlled_amount' => '1000000000',
            'active' => true,
            'stake_address' => $stakeAddress,
        ]);

        $result = $service->getWalletStats($stakeAddress);

        expect($result['balance'])->toBe('1,000.00 ADA');
        expect($result['status'])->toBe(true);
    }

    #[Test]
    public function it_handles_missing_blockfrost_config()
    {
        config(['services.blockfrost.project_id' => null]);

        $service = $this->mockServiceWithResponse([]);

        $result = $service->getWalletStats($this->testStakeAddress);

        expect($result)->toMatchArray([
            'balance' => '0.00 ADA',
            'status' => false,
            'stakeAddress' => $this->testStakeAddress,
            'payment_addresses' => [],
            'all_time_votes' => 0,
            'funds_participated' => [],
            'choice_stats' => [],
        ]);
    }
}
