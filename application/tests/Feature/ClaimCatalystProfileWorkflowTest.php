<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Http\Controllers\ClaimCatalystProfileWorkflowController;
use App\Models\CatalystProfile;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class ClaimCatalystProfileWorkflowTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function claiming_catalyst_profile_updates_database_correctly(): void
    {
        // Skip scout indexing during test setup
        config(['scout.driver' => 'null']);
        
        // Create a user
        $user = User::factory()->create();
        Auth::login($user);

        // Create a catalyst profile
        $catalystProfile = CatalystProfile::factory()->create([
            'name' => 'Original Name',
            'username' => 'original_username',
            'claimed_by' => null,
        ]);

        // Create proposals associated with this catalyst profile
        $proposal1 = Proposal::factory()->create();
        $proposal2 = Proposal::factory()->create();
        
        // Associate proposals with the catalyst profile using the pivot table
        DB::table('catalyst_profile_has_proposal')->insert([
            ['proposal_id' => $proposal1->id, 'catalyst_profile_id' => $catalystProfile->id],
            ['proposal_id' => $proposal2->id, 'catalyst_profile_id' => $catalystProfile->id],
        ]);

        // Create a mock request
        $request = new Request([
            'name' => 'Updated Name',
            'username' => 'updated_username',
            'catalystId' => 'test_catalyst_id',
            'stakeAddress' => 'test_stake_address',
        ]);

        // Directly test the controller method
        $controller = new ClaimCatalystProfileWorkflowController();
        $response = $controller->claimCatalystProfile($request, $catalystProfile);

        // Assert that the profile was updated in the database
        $updatedProfile = DB::table('catalyst_profiles')
            ->where('id', $catalystProfile->id)
            ->first();
            
        $this->assertEquals('Updated Name', $updatedProfile->name);
        $this->assertEquals('updated_username', $updatedProfile->username);
        $this->assertEquals($user->id, $updatedProfile->claimed_by);

        // Assert successful redirect
        $this->assertEquals(302, $response->getStatusCode());
    }

    /** @test */
    public function claiming_profile_without_related_proposals_works(): void
    {
        // Skip scout indexing during test setup
        config(['scout.driver' => 'null']);
        
        $user = User::factory()->create();
        Auth::login($user);

        // Create a catalyst profile with no associated proposals
        $catalystProfile = CatalystProfile::factory()->create([
            'name' => 'Original Name',
            'username' => 'original_username',
            'claimed_by' => null,
        ]);

        // Create a mock request
        $request = new Request([
            'name' => 'Updated Name',
            'username' => 'updated_username',
            'catalystId' => 'test_catalyst_id',
            'stakeAddress' => 'test_stake_address',
        ]);

        // This should not cause any errors even with no related proposals
        $controller = new ClaimCatalystProfileWorkflowController();
        $response = $controller->claimCatalystProfile($request, $catalystProfile);

        // Assert that the profile was updated in the database
        $updatedProfile = DB::table('catalyst_profiles')
            ->where('id', $catalystProfile->id)
            ->first();
            
        $this->assertEquals('Updated Name', $updatedProfile->name);
        $this->assertEquals('updated_username', $updatedProfile->username);
        $this->assertEquals($user->id, $updatedProfile->claimed_by);

        // Assert successful redirect
        $this->assertEquals(302, $response->getStatusCode());
    }

    /** @test */
    public function reindexing_logic_finds_related_proposals(): void
    {
        // Skip scout indexing during test setup
        config(['scout.driver' => 'null']);
        
        // Create a catalyst profile
        $catalystProfile = CatalystProfile::factory()->create();

        // Create proposals and associate them
        $proposal1 = Proposal::factory()->create();
        $proposal2 = Proposal::factory()->create();
        $proposal3 = Proposal::factory()->create(); // Not associated
        
        // Associate only proposal1 and proposal2 with the catalyst profile
        DB::table('catalyst_profile_has_proposal')->insert([
            ['proposal_id' => $proposal1->id, 'catalyst_profile_id' => $catalystProfile->id],
            ['proposal_id' => $proposal2->id, 'catalyst_profile_id' => $catalystProfile->id],
        ]);

        // Test that the relationship query works correctly
        $relatedProposals = Proposal::whereHas('catalyst_profiles', function ($query) use ($catalystProfile) {
            $query->where('catalyst_profiles.id', $catalystProfile->id);
        })->get();
        
        // Should find exactly 2 proposals
        $this->assertCount(2, $relatedProposals);
        $this->assertTrue($relatedProposals->contains('id', $proposal1->id));
        $this->assertTrue($relatedProposals->contains('id', $proposal2->id));
        $this->assertFalse($relatedProposals->contains('id', $proposal3->id));
    }
}
