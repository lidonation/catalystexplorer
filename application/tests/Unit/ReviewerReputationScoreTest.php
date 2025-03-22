<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\Fund;
use App\Models\Reviewer;
use App\Models\ReviewerReputationScore;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ReviewerReputationScoreTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_can_create_reviewer_reputation_score()
    {
        $reviewer = Reviewer::factory()->create();
        $reputationScore = ReviewerReputationScore::factory()->create([
            'reviewer_id' => $reviewer->id,
            'score' => 85,
        ]);

        $this->assertDatabaseHas('reviewer_reputation_scores', [
            'reviewer_id' => $reviewer->id,
            'score' => 85,
        ]);
    }

    #[Test]
    public function it_can_associate_reputation_score_with_fund()
    {
        $reviewer = Reviewer::factory()->create();
        $fund = Fund::factory()->create();

        $reputationScore = ReviewerReputationScore::factory()->create([
            'reviewer_id' => $reviewer->id,
            'context_type' => Fund::class,
            'context_id' => $fund->id,
            'score' => 90,
        ]);

        $this->assertDatabaseHas('reviewer_reputation_scores', [
            'reviewer_id' => $reviewer->id,
            'context_type' => Fund::class,
            'context_id' => $fund->id,
            'score' => 90,
        ]);
        $reputationScore = ReviewerReputationScore::find($reputationScore->id);
        $this->assertNotNull($reputationScore->context, 'Context relationship returned null');
        $this->assertEquals($fund->id, $reputationScore->context->id);
    }

    #[Test]
    public function it_has_many_reputation_scores_for_reviewer()
    {
        $reviewer = Reviewer::factory()->create();

        ReviewerReputationScore::factory()->count(3)->create([
            'reviewer_id' => $reviewer->id,
        ]);

        $this->assertEquals(3, $reviewer->reputationScores()->count());
    }
    #[Test]
    public function it_eager_loads_reputation_scores()
    {
        $reviewers = Reviewer::factory()->count(3)->create();

        foreach ($reviewers as $reviewer) {
            ReviewerReputationScore::factory()->count(2)->create([
                'reviewer_id' => $reviewer->id,
            ]);
        }

        $queryCount = 0;
        \DB::listen(function($query) use (&$queryCount) {
            $queryCount++;
        });

        $reviewersWithoutEager = Reviewer::all();
        foreach ($reviewersWithoutEager as $reviewer) {
            $reviewer->reputationScores->count();
        }

        $queriesWithoutEager = $queryCount;
        $queryCount = 0;

        $reviewersWithEager = Reviewer::with('reputationScores')->get();
        foreach ($reviewersWithEager as $reviewer) {
            $reviewer->reputationScores->count();
        }

        $queriesWithEager = $queryCount;
        $this->assertTrue($queriesWithoutEager > $queriesWithEager);
    }
}
