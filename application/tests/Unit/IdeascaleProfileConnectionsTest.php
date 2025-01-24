<?php

namespace Tests\Feature;

use App\Models\Connection;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use PHPUnit\Framework\Attributes\Test;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IdeascaleProfileConnectionsTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_fetches_correct_number_of_nodes_and_links()
    {
        $profile = IdeascaleProfile::factory()->create();

        $connectedUsers = IdeascaleProfile::factory(3)->create();
        $connectedGroups = Group::factory(2)->create();

        foreach ($connectedUsers as $user) {
            Connection::create([
                'previous_model_type' => IdeascaleProfile::class,
                'previous_model_id' => $profile->id,
                'next_model_type' => IdeascaleProfile::class,
                'next_model_id' => $user->id,
            ]);
        }

        foreach ($connectedGroups as $group) {
            Connection::create([
                'previous_model_type' => IdeascaleProfile::class,
                'previous_model_id' => $profile->id,
                'next_model_type' => Group::class,
                'next_model_id' => $group->id,
            ]);
        }

        $response = $this->getJson(route('api.ideascaleProfiles.connections', ['profile' => $profile->id]));

        $response->assertStatus(200);

        $responseData = $response->json();

        $this->assertCount(5, $responseData['nodes']);
        $this->assertCount(5, $responseData['links']);

        $expectedNodeIds = $connectedUsers->pluck('id')->merge($connectedGroups->pluck('id'))->push($profile->id)->all();

        // Validate links connect the correct nodes
        foreach ($responseData['links'] as $link) {
            $this->assertContains($link['source'], $expectedNodeIds);
            $this->assertContains($link['target'], $expectedNodeIds);
        }
    }
}
