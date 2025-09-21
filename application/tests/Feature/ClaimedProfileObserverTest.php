<?php

declare(strict_types=1);

use App\Models\CatalystProfile;
use App\Models\IdeascaleProfile;
use App\Models\Pivot\ClaimedProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClaimedProfileObserverTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_auto_generates_uuid_and_claimed_at_when_creating_claimed_profile(): void
    {
        // Arrange: Create test user and profile
        $user = User::factory()->create();
        $catalystProfile = CatalystProfile::factory()->create();

        // Act: Create a ClaimedProfile without setting id or claimed_at
        $claimedProfile = new ClaimedProfile();
        $claimedProfile->user_id = $user->id;
        $claimedProfile->claimable_id = $catalystProfile->id;
        $claimedProfile->claimable_type = CatalystProfile::class;
        // Note: we're NOT setting 'id' or 'claimed_at' to test the observer
        $claimedProfile->save();

        // Assert: Check that UUID and claimed_at were auto-populated
        $this->assertNotNull($claimedProfile->id);
        $this->assertIsString($claimedProfile->id);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/',
            $claimedProfile->id,
            'ID should be a valid UUID'
        );
        
        $this->assertNotNull($claimedProfile->claimed_at);
        $this->assertInstanceOf(\Carbon\Carbon::class, $claimedProfile->claimed_at);
    }

    /** @test */
    public function it_does_not_overwrite_existing_claimed_at_timestamp(): void
    {
        // Arrange: Create test user and profile
        $user = User::factory()->create();
        $ideascaleProfile = IdeascaleProfile::factory()->create();
        
        $customClaimedAt = now()->subDays(5);

        // Act: Create a ClaimedProfile with pre-set claimed_at
        $claimedProfile = new ClaimedProfile();
        $claimedProfile->user_id = $user->id;
        $claimedProfile->claimable_id = $ideascaleProfile->id;
        $claimedProfile->claimable_type = IdeascaleProfile::class;
        $claimedProfile->claimed_at = $customClaimedAt; // Pre-set the timestamp
        $claimedProfile->save();

        // Assert: Check that the pre-set claimed_at was not overwritten
        $this->assertTrue($claimedProfile->claimed_at->equalTo($customClaimedAt));
    }

    /** @test */
    public function it_prevents_uuid_modification_during_updates(): void
    {
        // Arrange: Create a ClaimedProfile
        $user = User::factory()->create();
        $catalystProfile = CatalystProfile::factory()->create();
        
        $claimedProfile = ClaimedProfile::create([
            'user_id' => $user->id,
            'claimable_id' => $catalystProfile->id,
            'claimable_type' => CatalystProfile::class,
        ]);
        
        $originalId = $claimedProfile->id;

        // Act: Try to change the UUID during update
        $claimedProfile->id = 'new-fake-uuid';
        $claimedProfile->save();

        // Assert: UUID should be preserved (not changed)
        $claimedProfile->refresh();
        $this->assertEquals($originalId, $claimedProfile->id);
    }

    /** @test */
    public function it_creates_relationships_correctly_with_observer(): void
    {
        // Arrange
        $user = User::factory()->create();
        $catalystProfile = CatalystProfile::factory()->create();

        // Act: Create ClaimedProfile using the observer
        $claimedProfile = ClaimedProfile::create([
            'user_id' => $user->id,
            'claimable_id' => $catalystProfile->id,
            'claimable_type' => CatalystProfile::class,
        ]);

        // Assert: Check relationships work correctly
        $this->assertEquals($user->id, $claimedProfile->user->id);
        $this->assertEquals($catalystProfile->id, $claimedProfile->claimable->id);
        $this->assertInstanceOf(CatalystProfile::class, $claimedProfile->claimable);
    }

    /** @test */
    public function it_works_with_user_claim_profile_method(): void
    {
        // Arrange
        $user = User::factory()->create();
        $catalystProfile = CatalystProfile::factory()->create();

        // Act: Use the User's claimProfile method (which triggers the observer)
        $claimedProfile = $user->claimProfile($catalystProfile);

        // Assert: Check that observer was triggered and relationships work
        $this->assertNotNull($claimedProfile->id);
        $this->assertNotNull($claimedProfile->claimed_at);
        $this->assertEquals($user->id, $claimedProfile->user->id);
        $this->assertEquals($catalystProfile->id, $claimedProfile->claimable->id);
        $this->assertInstanceOf(CatalystProfile::class, $claimedProfile->claimable);
        
        // Check that it prevents duplicates
        $duplicateAttempt = $user->claimProfile($catalystProfile);
        $this->assertEquals($claimedProfile->id, $duplicateAttempt->id);
    }
}