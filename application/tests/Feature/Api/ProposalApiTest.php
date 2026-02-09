<?php

declare(strict_types=1);

use App\Models\Campaign;
use App\Models\Discussion;
use App\Models\Fund;
use App\Models\Proposal;
use App\Models\Review;
use App\Models\Reviewer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();

    $this->fund = Fund::factory()->create(['user_id' => $this->user->id]);
    $this->campaign = Campaign::factory()->create([
        'fund_id' => $this->fund->id,
        'user_id' => $this->user->id,
    ]);
});

describe('Proposal API - Structured Content Fields', function () {

    it('returns pitch field when include_content=true and pitch is set', function () {
        $proposal = Proposal::factory()->create([
            'fund_id' => $this->fund->id,
            'campaign_id' => $this->campaign->id,
            'deleted_at' => null,
            'pitch' => [
                'team' => ['who' => 'Experienced developers'],
                'budget' => ['costs' => 'Development costs'],
                'value' => ['note' => 'Unique value proposition'],
            ],
        ]);

        $response = $this->getJson("/api/v1/proposals/{$proposal->id}?include_content=true");

        $response->assertStatus(200)
            ->assertJsonPath('data.pitch.team.who', 'Experienced developers')
            ->assertJsonPath('data.pitch.budget.costs', 'Development costs')
            ->assertJsonPath('data.pitch.value.note', 'Unique value proposition');
    });

    it('returns project_details field when include_content=true', function () {
        $proposal = Proposal::factory()->create([
            'fund_id' => $this->fund->id,
            'campaign_id' => $this->campaign->id,
            'deleted_at' => null,
            'project_details' => [
                'solution' => 'Our innovative solution',
                'impact' => 'Expected community impact',
                'feasibility' => 'Technical feasibility analysis',
            ],
        ]);

        $response = $this->getJson("/api/v1/proposals/{$proposal->id}?include_content=true");

        $response->assertStatus(200)
            ->assertJsonPath('data.project_details.solution', 'Our innovative solution')
            ->assertJsonPath('data.project_details.impact', 'Expected community impact')
            ->assertJsonPath('data.project_details.feasibility', 'Technical feasibility analysis');
    });

    it('returns category_questions field when include_content=true', function () {
        $proposal = Proposal::factory()->create([
            'fund_id' => $this->fund->id,
            'campaign_id' => $this->campaign->id,
            'deleted_at' => null,
            'category_questions' => [
                'target' => 'Target audience description',
                'activities' => 'Planned activities',
                'performance_metrics' => 'How we measure success',
            ],
        ]);

        $response = $this->getJson("/api/v1/proposals/{$proposal->id}?include_content=true");

        $response->assertStatus(200)
            ->assertJsonPath('data.category_questions.target', 'Target audience description')
            ->assertJsonPath('data.category_questions.activities', 'Planned activities')
            ->assertJsonPath('data.category_questions.performance_metrics', 'How we measure success');
    });

    it('returns theme field when include_content=true', function () {
        $proposal = Proposal::factory()->create([
            'fund_id' => $this->fund->id,
            'campaign_id' => $this->campaign->id,
            'deleted_at' => null,
            'theme' => [
                'group' => 'Development & Infrastructure',
                'tag' => 'Developer Tools',
            ],
        ]);

        $response = $this->getJson("/api/v1/proposals/{$proposal->id}?include_content=true");

        $response->assertStatus(200)
            ->assertJsonPath('data.theme.group', 'Development & Infrastructure')
            ->assertJsonPath('data.theme.tag', 'Developer Tools');
    });

    it('does not return structured fields when include_content is not set', function () {
        $proposal = Proposal::factory()->create([
            'fund_id' => $this->fund->id,
            'campaign_id' => $this->campaign->id,
            'deleted_at' => null,
            'pitch' => ['team' => ['who' => 'Test']],
            'project_details' => ['solution' => 'Test'],
            'category_questions' => ['target' => 'Test'],
            'theme' => ['group' => 'Test'],
        ]);

        $response = $this->getJson("/api/v1/proposals/{$proposal->id}");

        $response->assertStatus(200);

        $data = $response->json('data');
        expect($data)->not->toHaveKey('pitch')
            ->and($data)->not->toHaveKey('project_details')
            ->and($data)->not->toHaveKey('category_questions')
            ->and($data)->not->toHaveKey('theme');
    });
});

describe('Proposal API - Self Assessment Field', function () {

    it('returns self_assessment when set', function () {
        $proposal = Proposal::factory()->create([
            'fund_id' => $this->fund->id,
            'campaign_id' => $this->campaign->id,
            'deleted_at' => null,
            'self_assessment' => [
                'question_1' => 'Yes',
                'question_2' => 'Completed',
            ],
        ]);

        $response = $this->getJson("/api/v1/proposals/{$proposal->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.self_assessment.question_1', 'Yes')
            ->assertJsonPath('data.self_assessment.question_2', 'Completed');
    });
});

describe('Proposal API - Reviewer IDs Field', function () {

    it('returns reviewer_ids when proposal has reviews', function () {
        $proposal = Proposal::factory()->create([
            'fund_id' => $this->fund->id,
            'campaign_id' => $this->campaign->id,
            'deleted_at' => null,
        ]);

        // Create a discussion linked to the proposal
        $discussion = Discussion::factory()->create([
            'model_id' => $proposal->id,
            'model_type' => Proposal::class,
            'user_id' => $this->user->id,
        ]);

        // Create reviewers and reviews
        $reviewer1 = Reviewer::factory()->create();
        $reviewer2 = Reviewer::factory()->create();

        Review::factory()->create([
            'model_id' => $discussion->id,
            'model_type' => Discussion::class,
            'reviewer_id' => $reviewer1->id,
        ]);

        Review::factory()->create([
            'model_id' => $discussion->id,
            'model_type' => Discussion::class,
            'reviewer_id' => $reviewer2->id,
        ]);

        $response = $this->getJson("/api/v1/proposals/{$proposal->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.reviews_count', 2);

        $reviewerIds = $response->json('data.reviewer_ids');
        expect($reviewerIds)->toBeArray()
            ->and($reviewerIds)->toHaveCount(2)
            ->and($reviewerIds)->toContain($reviewer1->id)
            ->and($reviewerIds)->toContain($reviewer2->id);
    });

    it('returns empty reviewer_ids when proposal has no reviews', function () {
        $proposal = Proposal::factory()->create([
            'fund_id' => $this->fund->id,
            'campaign_id' => $this->campaign->id,
            'deleted_at' => null,
        ]);

        $response = $this->getJson("/api/v1/proposals/{$proposal->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.reviews_count', 0)
            ->assertJsonPath('data.reviewer_ids', []);
    });
});

describe('Campaign API - Category Details Field', function () {

    it('returns category_details when include_content=true', function () {
        $campaign = Campaign::factory()->create([
            'fund_id' => $this->fund->id,
            'user_id' => $this->user->id,
            'category_details' => [
                'overview' => 'Campaign overview text',
                'budget_constraints' => ['max_budget' => '500000 ADA'],
                'areas_of_interest' => ['DeFi', 'NFTs', 'Governance'],
                'who_should_apply' => 'Developers with experience',
            ],
        ]);

        $response = $this->getJson("/api/campaigns/{$campaign->id}?include_content=true");

        $response->assertStatus(200)
            ->assertJsonPath('data.category_details.overview', 'Campaign overview text')
            ->assertJsonPath('data.category_details.areas_of_interest', ['DeFi', 'NFTs', 'Governance'])
            ->assertJsonPath('data.category_details.who_should_apply', 'Developers with experience');
    });

    it('does not return category_details when include_content is not set', function () {
        $campaign = Campaign::factory()->create([
            'fund_id' => $this->fund->id,
            'user_id' => $this->user->id,
            'category_details' => ['overview' => 'Test overview'],
        ]);

        $response = $this->getJson("/api/campaigns/{$campaign->id}");

        $response->assertStatus(200);

        $data = $response->json('data');
        expect($data)->not->toHaveKey('category_details');
    });
});
