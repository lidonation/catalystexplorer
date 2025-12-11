<?php

declare(strict_types=1);

use App\Models\Meta;
use App\Models\Proposal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MetaObserverTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_auto_generates_uuid_when_creating_meta_without_id(): void
    {
        // Arrange: Create test proposal to associate meta with
        $proposal = Proposal::factory()->create();

        // Act: Create a Meta without setting id
        $meta = new Meta();
        $meta->model_type = Proposal::class;
        $meta->model_id = $proposal->id;
        $meta->key = 'test_key';
        $meta->content = 'test_content';
        // Note: we're NOT setting 'id' to test the observer
        $meta->save();

        // Assert: Check that UUID was auto-populated
        $this->assertNotNull($meta->id);
        $this->assertIsString($meta->id);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/',
            $meta->id,
            'ID should be a valid UUID'
        );
    }

    /** @test */
    public function it_does_not_overwrite_existing_id_when_provided(): void
    {
        // Arrange: Create test proposal and a custom UUID
        $proposal = Proposal::factory()->create();
        $customId = '12345678-1234-4123-8123-123456789012';

        // Act: Create a Meta with pre-set ID
        $meta = new Meta();
        $meta->id = $customId; // Pre-set the ID
        $meta->model_type = Proposal::class;
        $meta->model_id = $proposal->id;
        $meta->key = 'test_key';
        $meta->content = 'test_content';
        $meta->save();

        // Assert: Check that the pre-set ID was not overwritten
        $this->assertEquals($customId, $meta->id);
    }

    /** @test */
    public function it_generates_uuid_when_using_create_method(): void
    {
        // Arrange: Create test proposal
        $proposal = Proposal::factory()->create();

        // Act: Create Meta using create method (which also triggers observer)
        $meta = Meta::create([
            'model_type' => Proposal::class,
            'model_id' => $proposal->id,
            'key' => 'test_key',
            'content' => 'test_content',
        ]);

        // Assert: Check that UUID was auto-populated
        $this->assertNotNull($meta->id);
        $this->assertIsString($meta->id);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/',
            $meta->id,
            'ID should be a valid UUID'
        );
    }

    /** @test */
    public function it_does_not_modify_id_during_updates(): void
    {
        // Arrange: Create a Meta record
        $proposal = Proposal::factory()->create();
        
        $meta = Meta::create([
            'model_type' => Proposal::class,
            'model_id' => $proposal->id,
            'key' => 'test_key',
            'content' => 'original_content',
        ]);
        
        $originalId = $meta->id;

        // Act: Update the Meta record
        $meta->content = 'updated_content';
        $meta->save();

        // Assert: UUID should remain unchanged
        $meta->refresh();
        $this->assertEquals($originalId, $meta->id);
        $this->assertEquals('updated_content', $meta->content);
    }

    /** @test */
    public function it_works_with_proposal_saveMeta_method(): void
    {
        // Arrange: Create a proposal
        $proposal = Proposal::factory()->create();

        // Act: Use the Proposal's saveMeta method (which creates Meta records)
        $proposal->saveMeta('test_key', 'test_value', $proposal);

        // Assert: Check that the Meta record has a UUID
        $meta = Meta::where('model_type', Proposal::class)
            ->where('model_id', $proposal->id)
            ->where('key', 'test_key')
            ->first();

        $this->assertNotNull($meta);
        $this->assertNotNull($meta->id);
        $this->assertIsString($meta->id);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/',
            $meta->id,
            'ID should be a valid UUID'
        );
        $this->assertEquals('test_value', $meta->content);
    }

    /** @test */
    public function it_handles_empty_string_id_as_null(): void
    {
        // Arrange: Create test proposal
        $proposal = Proposal::factory()->create();

        // Act: Create a Meta with empty string ID (should be treated as null)
        $meta = new Meta();
        $meta->id = ''; // Empty string should trigger UUID generation
        $meta->model_type = Proposal::class;
        $meta->model_id = $proposal->id;
        $meta->key = 'test_key';
        $meta->content = 'test_content';
        $meta->save();

        // Assert: Check that UUID was generated despite empty string
        $this->assertNotNull($meta->id);
        $this->assertNotEmpty($meta->id);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/',
            $meta->id,
            'ID should be a valid UUID'
        );
    }
}