<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Proposal;
use App\Services\ProposalContentParserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

/*
|--------------------------------------------------------------------------
| Helpers: Markdown content fixtures for different fund eras
|--------------------------------------------------------------------------
*/

function fund10Content(): string
{
    return <<<'MD'
### \[SOLUTION\]
We will build a decentralized identity platform that allows users to verify their credentials on-chain.

### \[IMPACT\]
This project will contribute significantly to the Cardano ecosystem by providing a reusable identity layer for dApps.

### \[CAPABILITY & FEASIBILITY\]
Our team has 10 years of combined experience in blockchain development. We have completed 3 Catalyst projects.

### \[TEAM\]
John Doe - Lead Developer (5 years Haskell)
Jane Smith - Project Manager (PMP certified)

### \[BUDGET & COSTS\]
Development: $30,000
Testing: $10,000
Documentation: $5,000
Total: $45,000

### \[PROJECT MILESTONES\]
Month 1-2: Research and architecture design
Month 3-4: Core development
Month 5: Testing and QA
Month 6: Launch and documentation

### \[TARGET\]
Our target audience is Cardano DApp developers and SPOs.

### \[ACTIVITIES\]
- Host weekly workshops
- Create video tutorials
MD;
}

function fund6Content(): string
{
    return <<<'MD'
## Solution
Our project creates an open-source library for Cardano smart contract testing.

## Impact
Developers will save 40% of their testing time using our framework.

## Feasibility
We have delivered similar tools for Ethereum and Polkadot ecosystems.

## Team
Alice Johnson - Plutus Developer
Bob Williams - QA Engineer

## Budget
Smart contract library: 25,000 ADA
Documentation: 5,000 ADA

## Milestones
Phase 1: Prototype (2 months)
Phase 2: Beta release (2 months)
MD;
}

/*
|--------------------------------------------------------------------------
| Model Accessor Tests
|--------------------------------------------------------------------------
*/

describe('Proposal model accessors', function () {

    test('returns JSONB data when already populated', function () {
        $existingData = ['solution' => 'Already structured', 'impact' => 'High'];

        $proposal = Proposal::factory()->create([
            'project_details' => json_encode($existingData),
            'content' => json_encode(['en' => fund10Content()]),
        ]);

        $fresh = Proposal::withoutGlobalScopes()->find($proposal->id);

        expect($fresh->project_details)->toBeArray()
            ->and($fresh->project_details)->toHaveKey('solution')
            ->and($fresh->project_details['solution'])->toBe('Already structured');
    });

    test('parses project_details from Fund 10-13 content when JSONB is null', function () {
        $proposal = Proposal::factory()->create([
            'project_details' => null,
            'content' => json_encode(['en' => fund10Content()]),
        ]);

        $fresh = Proposal::withoutGlobalScopes()->find($proposal->id);

        expect($fresh->project_details)->toBeArray()
            ->and($fresh->project_details)->toHaveKey('solution')
            ->and($fresh->project_details['solution'])->toContain('decentralized identity platform');
    });

    test('parses pitch from Fund 10-13 content when JSONB is null', function () {
        $proposal = Proposal::factory()->create([
            'pitch' => null,
            'content' => json_encode(['en' => fund10Content()]),
        ]);

        $fresh = Proposal::withoutGlobalScopes()->find($proposal->id);

        expect($fresh->pitch)->toBeArray()
            ->and($fresh->pitch)->toHaveKey('team')
            ->and($fresh->pitch['team'])->toContain('John Doe');
    });

    test('parses category_questions from Fund 10-13 content when JSONB is null', function () {
        $proposal = Proposal::factory()->create([
            'category_questions' => null,
            'content' => json_encode(['en' => fund10Content()]),
        ]);

        $fresh = Proposal::withoutGlobalScopes()->find($proposal->id);

        expect($fresh->category_questions)->toBeArray()
            ->and($fresh->category_questions)->toHaveKey('target')
            ->and($fresh->category_questions['target'])->toContain('DApp developers');
    });

    test('parses from Fund 6-9 content format', function () {
        $proposal = Proposal::factory()->create([
            'project_details' => null,
            'pitch' => null,
            'content' => json_encode(['en' => fund6Content()]),
        ]);

        $fresh = Proposal::withoutGlobalScopes()->find($proposal->id);

        expect($fresh->project_details)->toBeArray()
            ->and($fresh->project_details['solution'])->toContain('open-source library')
            ->and($fresh->pitch)->toBeArray()
            ->and($fresh->pitch['team'])->toContain('Alice Johnson');
    });

    test('returns null when content is empty', function () {
        $proposal = Proposal::factory()->create([
            'project_details' => null,
            'pitch' => null,
            'content' => null,
        ]);

        $fresh = Proposal::withoutGlobalScopes()->find($proposal->id);

        expect($fresh->project_details)->toBeNull()
            ->and($fresh->pitch)->toBeNull();
    });

    test('returns null when content has no parseable sections', function () {
        $proposal = Proposal::factory()->create([
            'project_details' => null,
            'content' => json_encode(['en' => 'Just a plain paragraph with no structured sections at all.']),
        ]);

        $fresh = Proposal::withoutGlobalScopes()->find($proposal->id);

        expect($fresh->project_details)->toBeNull();
    });

    test('accessor does not write to database (side-effect free)', function () {
        $proposal = Proposal::factory()->create([
            'project_details' => null,
            'content' => json_encode(['en' => fund10Content()]),
        ]);

        $fresh = Proposal::withoutGlobalScopes()->find($proposal->id);

        // Access the accessor - should parse and return data
        $result = $fresh->project_details;
        expect($result)->not->toBeNull();

        // Verify the DB column is still null (no side-effect write)
        $rawValue = DB::table('proposals')->where('id', $proposal->id)->value('project_details');
        expect($rawValue)->toBeNull();
    });
});

/*
|--------------------------------------------------------------------------
| Backfill Command Tests
|--------------------------------------------------------------------------
*/

describe('proposals:backfill-structured-data command', function () {

    test('backfills structured data for proposals with parseable content', function () {
        $proposal = Proposal::factory()->create([
            'project_details' => null,
            'pitch' => null,
            'category_questions' => null,
            'theme' => null,
            'content' => json_encode(['en' => fund10Content()]),
        ]);

        $this->artisan('proposals:backfill-structured-data')
            ->assertExitCode(0);

        $rawDetails = DB::table('proposals')->where('id', $proposal->id)->value('project_details');
        $parsed = json_decode($rawDetails, true);

        expect($parsed)->toBeArray()
            ->and($parsed)->toHaveKey('solution')
            ->and($parsed['solution'])->toContain('decentralized identity platform');
    });

    test('dry-run does not write to database', function () {
        $proposal = Proposal::factory()->create([
            'project_details' => null,
            'content' => json_encode(['en' => fund10Content()]),
        ]);

        $this->artisan('proposals:backfill-structured-data', ['--dry-run' => true])
            ->assertExitCode(0);

        $rawValue = DB::table('proposals')->where('id', $proposal->id)->value('project_details');
        expect($rawValue)->toBeNull();
    });

    test('skips proposals that already have data (without --force)', function () {
        $existingData = ['solution' => 'Pre-existing data'];

        $proposal = Proposal::factory()->create([
            'project_details' => json_encode($existingData),
            'pitch' => null,
            'content' => json_encode(['en' => fund10Content()]),
        ]);

        $this->artisan('proposals:backfill-structured-data', ['--field' => 'project_details'])
            ->assertExitCode(0);

        // Should still have the original data
        $rawValue = DB::table('proposals')->where('id', $proposal->id)->value('project_details');
        $parsed = json_decode($rawValue, true);
        expect($parsed['solution'])->toBe('Pre-existing data');
    });

    test('--force overwrites existing data', function () {
        $existingData = ['solution' => 'Old data'];

        $proposal = Proposal::factory()->create([
            'project_details' => json_encode($existingData),
            'content' => json_encode(['en' => fund10Content()]),
        ]);

        $this->artisan('proposals:backfill-structured-data', [
            '--field' => 'project_details',
            '--force' => true,
        ])->assertExitCode(0);

        $rawValue = DB::table('proposals')->where('id', $proposal->id)->value('project_details');
        $parsed = json_decode($rawValue, true);
        expect($parsed['solution'])->toContain('decentralized identity platform');
    });

    test('--field filters to only the specified field', function () {
        $proposal = Proposal::factory()->create([
            'project_details' => null,
            'pitch' => null,
            'content' => json_encode(['en' => fund10Content()]),
        ]);

        $this->artisan('proposals:backfill-structured-data', ['--field' => 'pitch'])
            ->assertExitCode(0);

        // Pitch should be populated
        $rawPitch = DB::table('proposals')->where('id', $proposal->id)->value('pitch');
        expect(json_decode($rawPitch, true))->toHaveKey('team');

        // project_details should still be null (was not targeted)
        $rawDetails = DB::table('proposals')->where('id', $proposal->id)->value('project_details');
        expect($rawDetails)->toBeNull();
    });

    test('--limit restricts number of proposals processed', function () {
        Proposal::factory()->count(5)->create([
            'project_details' => null,
            'content' => json_encode(['en' => fund10Content()]),
        ]);

        $this->artisan('proposals:backfill-structured-data', ['--limit' => 2])
            ->assertExitCode(0);

        $filledCount = DB::table('proposals')
            ->whereNotNull('project_details')
            ->count();

        expect($filledCount)->toBe(2);
    });

    test('skips proposals with no parseable content', function () {
        $proposal = Proposal::factory()->create([
            'project_details' => null,
            'content' => json_encode(['en' => 'Just a plain paragraph with nothing structured.']),
        ]);

        $this->artisan('proposals:backfill-structured-data')
            ->assertExitCode(0);

        $rawValue = DB::table('proposals')->where('id', $proposal->id)->value('project_details');
        expect($rawValue)->toBeNull();
    });

    test('rejects invalid field names', function () {
        $this->artisan('proposals:backfill-structured-data', ['--field' => 'bogus_field'])
            ->assertExitCode(1);
    });

    test('handles proposals with translated JSON content', function () {
        $proposal = Proposal::factory()->create([
            'project_details' => null,
            'content' => json_encode([
                'en' => fund10Content(),
                'es' => '### \[SOLUTION\]\nSolución en español',
            ]),
        ]);

        $this->artisan('proposals:backfill-structured-data')
            ->assertExitCode(0);

        $rawValue = DB::table('proposals')->where('id', $proposal->id)->value('project_details');
        $parsed = json_decode($rawValue, true);

        // Should use English content
        expect($parsed['solution'])->toContain('decentralized identity platform');
    });
});
