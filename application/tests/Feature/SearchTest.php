<?php

declare(strict_types=1);

use App\Models\Fund;
use App\Models\Proposal;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Models\User;
use App\Enums\ProposalFundingStatus;
use App\Enums\ProposalStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

describe('Search Page Route and Response', function () {
    it('renders search page successfully with query parameter', function () {
        $response = $this->get(route('en.search.index', ['q' => 'lido']));
        
        $response->assertStatus(200)
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('S/Index')
                    ->has('counts')
                    ->where('locale', 'en')
            );
    });

    it('renders search page without query parameter', function () {
        $response = $this->get(route('en.search.index'));
        
        $response->assertStatus(200)
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('S/Index')
                    ->has('counts')
            );
    });

    it('handles empty search query gracefully', function () {
        $response = $this->get(route('en.search.index', ['q' => '']));
        
        $response->assertStatus(200);
    });
});

describe('Search Backend Data Structure', function () {
    it('returns correct data structure for search results', function () {
        $response = $this->get(route('en.search.index', ['q' => 'test']));
        
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('S/Index')
                ->has('counts')
                ->has('counts.proposals')
                ->has('counts.groups')
                ->has('counts.ideascaleProfiles')
                ->has('counts.total')
        );
    });

    it('provides search results data alongside counts', function () {
        // Create test data
        $fund = Fund::factory()->create(['title' => 'Test Fund']);
        $proposal = Proposal::factory()->create([
            'title' => 'Lido Nation Test Proposal',
            'fund_id' => $fund->id,
            'funding_status' => ProposalFundingStatus::funded()->value,
            'status' => ProposalStatus::complete()->value,
        ]);

        $response = $this->get(route('en.search.index', ['q' => 'lido']));
        
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('S/Index')
                ->has('counts')
                ->has('proposals') // Should have search results data
                ->has('groups')
                ->has('ideascaleProfiles')
        );
    });

    it('returns zero counts when no results found', function () {
        $response = $this->get(route('en.search.index', ['q' => 'nonexistentquerythatshouldhave0results']));
        
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('S/Index')
                ->has('counts')
                ->where('counts.total', 0)
                ->where('counts.proposals', 0)
                ->where('counts.groups', 0)
                ->where('counts.ideascaleProfiles', 0)
        );
    });
});

describe('Search Functionality with Test Data', function () {
    beforeEach(function () {
        // Create test data for search
        $this->fund = Fund::factory()->create(['title' => 'Test Fund']);
        
        $this->proposal = Proposal::factory()->create([
            'title' => 'Lido Nation Cardano Proposal',
            'problem_statement' => 'This proposal addresses staking solutions',
            'fund_id' => $this->fund->id,
            'funding_status' => ProposalFundingStatus::funded()->value,
            'status' => ProposalStatus::complete()->value,
        ]);

        $this->group = Group::factory()->create([
            'name' => 'Lido Staking Group',
            'bio' => 'A group focused on liquid staking solutions',
        ]);

        $this->ideascaleProfile = IdeascaleProfile::factory()->create([
            'name' => 'Lido Community Member',
            'bio' => 'Active in the Cardano ecosystem',
        ]);
    });

    it('finds proposals by title', function () {
        $response = $this->get(route('en.search.index', ['q' => 'Lido']));
        
        $response->assertInertia(
            fn (Assert $page) => $page
                ->where('counts.proposals', 1)
                ->where('counts.total', 3) // proposal + group + ideascale profile
        );
    });

    it('finds groups by name', function () {
        $response = $this->get(route('en.search.index', ['q' => 'Staking']));
        
        $response->assertInertia(
            fn (Assert $page) => $page
                ->where('counts.groups', 1)
        );
    });

    it('finds ideascale profiles', function () {
        $response = $this->get(route('en.search.index', ['q' => 'Community']));
        
        $response->assertInertia(
            fn (Assert $page) => $page
                ->where('counts.ideascaleProfiles', 1)
        );
    });

    it('performs case-insensitive search', function () {
        $response = $this->get(route('en.search.index', ['q' => 'LIDO']));
        
        $response->assertInertia(
            fn (Assert $page) => $page
                ->where('counts.total', fn ($total) => $total > 0)
        );
    });

    it('handles special characters in search query', function () {
        $response = $this->get(route('en.search.index', ['q' => 'Lido & Cardano']));
        
        // Should not crash and should return some results
        $response->assertStatus(200)
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('S/Index')
                    ->has('counts')
            );
    });

    it('handles very long search queries', function () {
        $longQuery = str_repeat('lido', 100);
        $response = $this->get(route('en.search.index', ['q' => $longQuery]));
        
        $response->assertStatus(200);
    });
});

describe('Search Performance and Error Handling', function () {
    it('completes search request within reasonable time', function () {
        $startTime = microtime(true);
        
        $response = $this->get(route('en.search.index', ['q' => 'performance test']));
        
        $endTime = microtime(true);
        $duration = ($endTime - $startTime) * 1000; // Convert to milliseconds
        
        $response->assertStatus(200);
        
        // Search should complete within 2 seconds
        expect($duration)->toBeLessThan(2000);
    });

    it('handles malformed query parameters gracefully', function () {
        // Test with array instead of string
        $response = $this->get('/en/s?q[]=test');
        
        $response->assertStatus(200);
    });

    it('maintains consistent response structure regardless of query', function () {
        $queries = ['', 'test', 'nonexistent', 'special!@#$%', '123456789'];
        
        foreach ($queries as $query) {
            $response = $this->get(route('en.search.index', ['q' => $query]));
            
            $response->assertStatus(200)
                ->assertInertia(
                    fn (Assert $page) => $page
                        ->component('S/Index')
                        ->has('counts')
                        ->has('counts.proposals')
                        ->has('counts.groups')
                        ->has('counts.ideascaleProfiles')
                        ->has('counts.total')
                );
        }
    });
});

describe('Search Integration with Meilisearch', function () {
    it('search results reflect database state', function () {
        // Create a proposal
        $proposal = Proposal::factory()->create([
            'title' => 'Unique Test Proposal for Search',
            'fund_id' => Fund::factory()->create()->id,
        ]);

        // Note: In a real test environment, you might need to manually index
        // or wait for indexing depending on your Meilisearch setup
        
        $response = $this->get(route('en.search.index', ['q' => 'Unique Test Proposal']));
        
        $response->assertStatus(200);
        
        // The exact assertion here depends on whether the test environment
        // has Meilisearch properly configured and indexed
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('S/Index')
                ->has('counts')
        );
    });

    it('gracefully handles Meilisearch service unavailable', function () {
        // This test would be useful if you can mock Meilisearch to be unavailable
        // For now, we just test that the endpoint doesn't crash
        
        $response = $this->get(route('en.search.index', ['q' => 'service test']));
        
        $response->assertStatus(200)
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('S/Index')
                    ->has('counts')
            );
    });
});

describe('Multi-language Search Support', function () {
    it('handles different language routes', function () {
        // Test English route
        $response = $this->get(route('en.search.index', ['q' => 'test']));
        $response->assertStatus(200)
            ->assertInertia(
                fn (Assert $page) => $page
                    ->where('locale', 'en')
            );
    });

    it('handles non-English characters in search', function () {
        $response = $this->get(route('en.search.index', ['q' => 'café résumé naïve']));
        
        $response->assertStatus(200)
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('S/Index')
                    ->has('counts')
            );
    });
});

describe('Search Security', function () {
    it('sanitizes search input to prevent XSS', function () {
        $maliciousQuery = '<script>alert("xss")</script>';
        
        $response = $this->get(route('en.search.index', ['q' => $maliciousQuery]));
        
        $response->assertStatus(200);
        
        // The response should not contain unescaped script tags
        $content = $response->getContent();
        expect($content)->not->toContain('<script>alert("xss")</script>');
    });

    it('handles SQL injection attempts in search query', function () {
        $sqlQuery = "'; DROP TABLE proposals; --";
        
        $response = $this->get(route('en.search.index', ['q' => $sqlQuery]));
        
        // Should not crash and should return normal response
        $response->assertStatus(200)
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('S/Index')
                    ->has('counts')
            );
    });
});