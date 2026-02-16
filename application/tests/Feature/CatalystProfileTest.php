<?php

namespace Tests\Feature;

use App\Enums\CatalystCurrencySymbols;
use App\Models\CatalystProfile;
use App\Models\Fund;
use App\Models\Proposal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalystProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalyst_profile_aggregates_ada_correctly()
    {
        $profile = CatalystProfile::factory()->create();
        $fundAda = Fund::factory()->create(['currency' => CatalystCurrencySymbols::ADA->name]);

        $proposal1 = Proposal::factory()->create([
            'fund_id' => $fundAda->id,
            'amount_requested' => 1000,
            'funded_at' => now(), // funded
            'amount_received' => 500,
        ]);

        $proposal2 = Proposal::factory()->create([
            'fund_id' => $fundAda->id,
            'amount_requested' => 2000,
            'funded_at' => null, // not funded
            'amount_received' => 0,
        ]);

        $profile->proposals()->attach([$proposal1->id, $proposal2->id]);

        $this->assertEquals(3000, $profile->amountRequestedAda);
        $this->assertEquals(1000, $profile->amountAwardedAda);
        $this->assertEquals(500, $profile->amountDistributedAda);

        // Ensure USDM is 0
        $this->assertEquals(0, $profile->amountRequestedUsdm);
    }

    public function test_catalyst_profile_aggregates_usdm_correctly()
    {
        $profile = CatalystProfile::factory()->create();
        $fundUsdm = Fund::factory()->create(['currency' => CatalystCurrencySymbols::USDM->name]);

        $proposal1 = Proposal::factory()->create([
            'fund_id' => $fundUsdm->id,
            'amount_requested' => 100,
            'funded_at' => now(),
            'amount_received' => 50,
        ]);

        $profile->proposals()->attach($proposal1->id);

        $this->assertEquals(0, $profile->amountRequestedAda);
        $this->assertEquals(100, $profile->amountRequestedUsdm);
        $this->assertEquals(100, $profile->amountAwardedUsdm);
        $this->assertEquals(50, $profile->amountDistributedUsdm);
    }
}
