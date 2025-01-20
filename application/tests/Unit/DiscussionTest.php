<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\Discussion;
use App\Models\Review;
use App\Models\Proposal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class DiscussionTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_has_a_review_relationship()
    {

        $review = Review::factory()->create();
        $discussion = Discussion::factory()->create([
            'model_type' => Review::class,
            'model_id' => $review->id,
        ]);

        $this->assertInstanceOf(Review::class, $discussion->review);
        $this->assertEquals($review->id, $discussion->review->id);
    }

    #[Test]
    public function it_has_a_proposal_relationship()
    {
        $proposal = Proposal::factory()->create();
        $discussion = Discussion::factory()->create([
            'model_type' => Proposal::class,
            'model_id' => $proposal->id,
        ]);

        $this->assertInstanceOf(Proposal::class, $discussion->proposal);
        $this->assertEquals($proposal->id, $discussion->proposal->id);
    }

    #[Test]
    public function it_correctly_casts_dates()
    {
        $discussion = Discussion::factory()->create([
            'updated_at' => now()->subDays(2),
            'published_at' => now()->subDays(10),
        ]);

        $this->assertEquals($discussion->updated_at->format('Y-m-d'), now()->subDays(2)->format('Y-m-d'));
        $this->assertEquals($discussion->published_at->format('Y-m-d'), now()->subDays(10)->format('Y-m-d'));
    }

    #[Test]
    public function it_has_a_polymorphic_model_relationship()
    {
        $review = Review::factory()->create();
        $discussion = Discussion::factory()->create([
            'model_type' => Review::class,
            'model_id' => $review->id,
        ]);

        $this->assertInstanceOf(Review::class, $discussion->model);
    }
}
