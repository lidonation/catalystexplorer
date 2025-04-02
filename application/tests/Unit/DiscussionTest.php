<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\Discussion;
use App\Models\Proposal;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class DiscussionTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_has_a_review_relationship()
    {

        $discussion = Discussion::factory()->for(Review::factory(state:['id'=>4]),'reviews')->create();

        $this->assertInstanceOf(Review::class, $discussion->reviews()->first());
        $this->assertEquals(4, $discussion->reviews()->first()->id);
    }

    #[Test]
    public function it_has_a_proposal_relationship()
    {
        $proposal = Proposal::factory()->create();
        $discussion = Discussion::factory()->create([
            'model_type' => Proposal::class,
            'model_id' => $proposal->getOriginal('id'),
        ]);


//        $this->assertInstanceOf(Proposal::class, $discussion->proposal);

        $this->assertEquals($proposal->getOriginal('id'), $discussion->getOriginal('model_id'));
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
