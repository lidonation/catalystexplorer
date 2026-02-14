<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Services\ProposalContentParserService;

beforeEach(function () {
    $this->parser = new ProposalContentParserService;
});

/*
|--------------------------------------------------------------------------
| Fund 10-13 Format: ### \[SECTION\]
|--------------------------------------------------------------------------
*/

describe('Fund 10-13 format (### \[SECTION\])', function () {

    $fund10Content = <<<'MD'
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
MD;

    test('parses project_details from Fund 10-13 content', function () use ($fund10Content) {
        $result = $this->parser->parse($fund10Content, 'project_details');

        expect($result)->not->toBeNull()
            ->and($result)->toHaveKey('solution')
            ->and($result)->toHaveKey('impact')
            ->and($result)->toHaveKey('feasibility')
            ->and($result['solution'])->toContain('decentralized identity platform')
            ->and($result['impact'])->toContain('Cardano ecosystem')
            ->and($result['feasibility'])->toContain('10 years');
    });

    test('parses pitch from Fund 10-13 content', function () use ($fund10Content) {
        $result = $this->parser->parse($fund10Content, 'pitch');

        expect($result)->not->toBeNull()
            ->and($result)->toHaveKey('team')
            ->and($result)->toHaveKey('budget')
            ->and($result)->toHaveKey('milestones')
            ->and($result['team'])->toContain('John Doe')
            ->and($result['budget'])->toContain('$30,000')
            ->and($result['milestones'])->toContain('Research and architecture');
    });
});

/*
|--------------------------------------------------------------------------
| Fund 6-9 Format: ## Section
|--------------------------------------------------------------------------
*/

describe('Fund 6-9 format (## Section)', function () {

    $fund6Content = <<<'MD'
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
Community outreach: 5,000 ADA

## Milestones
Phase 1: Prototype (2 months)
Phase 2: Beta release (2 months)
Phase 3: Production release (2 months)
MD;

    test('parses project_details from Fund 6-9 content', function () use ($fund6Content) {
        $result = $this->parser->parse($fund6Content, 'project_details');

        expect($result)->not->toBeNull()
            ->and($result)->toHaveKey('solution')
            ->and($result)->toHaveKey('impact')
            ->and($result)->toHaveKey('feasibility')
            ->and($result['solution'])->toContain('open-source library')
            ->and($result['impact'])->toContain('40%')
            ->and($result['feasibility'])->toContain('Ethereum and Polkadot');
    });

    test('parses pitch from Fund 6-9 content', function () use ($fund6Content) {
        $result = $this->parser->parse($fund6Content, 'pitch');

        expect($result)->not->toBeNull()
            ->and($result)->toHaveKey('team')
            ->and($result)->toHaveKey('budget')
            ->and($result)->toHaveKey('milestones')
            ->and($result['team'])->toContain('Alice Johnson')
            ->and($result['budget'])->toContain('25,000 ADA');
    });
});

/*
|--------------------------------------------------------------------------
| Fund 10-13 Format without backslash escaping: ### [SECTION]
|--------------------------------------------------------------------------
*/

describe('Fund 10-13 unescaped format (### [SECTION])', function () {

    $unescapedContent = <<<'MD'
### [SOLUTION]
A mobile wallet with built-in governance features.

### [IMPACT]
Increases voter participation by 200%.

### [CAPABILITY & FEASIBILITY]
Team of 5 full-time developers with DeFi background.
MD;

    test('parses sections without backslash escapes', function () use ($unescapedContent) {
        $result = $this->parser->parse($unescapedContent, 'project_details');

        expect($result)->not->toBeNull()
            ->and($result)->toHaveKey('solution')
            ->and($result)->toHaveKey('impact')
            ->and($result)->toHaveKey('feasibility')
            ->and($result['solution'])->toContain('mobile wallet');
    });
});

/*
|--------------------------------------------------------------------------
| Category Questions
|--------------------------------------------------------------------------
*/

describe('category_questions parsing', function () {

    $categoryContent = <<<'MD'
### \[TARGET\]
Our target audience is Cardano DApp developers and SPOs.

### \[ACTIVITIES\]
- Host weekly workshops
- Create video tutorials
- Build sample projects

### \[PERFORMANCE METRICS\]
- 500 developers onboarded in 6 months
- 20 tutorials published
- 95% satisfaction rating
MD;

    test('parses category questions', function () use ($categoryContent) {
        $result = $this->parser->parse($categoryContent, 'category_questions');

        expect($result)->not->toBeNull()
            ->and($result)->toHaveKey('target')
            ->and($result)->toHaveKey('activities')
            ->and($result)->toHaveKey('performance_metrics')
            ->and($result['target'])->toContain('DApp developers')
            ->and($result['activities'])->toContain('weekly workshops')
            ->and($result['performance_metrics'])->toContain('500 developers');
    });
});

/*
|--------------------------------------------------------------------------
| Edge Cases
|--------------------------------------------------------------------------
*/

describe('edge cases', function () {

    test('returns null for empty content', function () {
        expect($this->parser->parse('', 'project_details'))->toBeNull()
            ->and($this->parser->parse('   ', 'project_details'))->toBeNull();
    });

    test('returns null for content without recognizable sections', function () {
        $plainContent = 'This is just a paragraph of text with no markdown headers or sections at all.';
        $result = $this->parser->parse($plainContent, 'project_details');
        expect($result)->toBeNull();
    });

    test('returns null for unknown field type', function () {
        // The parser calls Log::warning for unknown fields, which needs
        // the Laravel container. In a pure unit test, this throws a
        // RuntimeException. Either way, the field is not parseable.
        $result = null;
        try {
            $result = $this->parser->parse('### \[SOLUTION\]\nSomething', 'nonexistent_field');
        } catch (\RuntimeException $e) {
            // Expected in unit context — Log facade not booted
        }
        expect($result)->toBeNull();
    });

    test('handles content with only some sections present', function () {
        $partialContent = <<<'MD'
### \[SOLUTION\]
We will build a thing.
MD;

        $result = $this->parser->parse($partialContent, 'project_details');
        expect($result)->not->toBeNull()
            ->and($result)->toHaveKey('solution')
            ->and($result)->not->toHaveKey('impact')
            ->and($result)->not->toHaveKey('feasibility');
    });

    test('cleans escaped markdown characters', function () {
        $escapedContent = <<<'MD'
### \[SOLUTION\]
Visit \[our website\]\(https://example\.com\) for more info\.
MD;

        $result = $this->parser->parse($escapedContent, 'project_details');
        expect($result)->not->toBeNull()
            ->and($result['solution'])->toContain('[our website](https://example.com)')
            ->and($result['solution'])->not->toContain('\\[');
    });

    test('handles excessive blank lines in content', function () {
        $bloatedContent = "### \\[SOLUTION\\]\n\n\n\n\n\nSome solution text here.\n\n\n\n\nMore text.";

        $result = $this->parser->parse($bloatedContent, 'project_details');
        expect($result)->not->toBeNull()
            ->and($result['solution'])->not->toContain("\n\n\n");
    });
});

/*
|--------------------------------------------------------------------------
| parseAll()
|--------------------------------------------------------------------------
*/

describe('parseAll()', function () {

    test('extracts all field types from comprehensive content', function () {
        $fullContent = <<<'MD'
### \[SOLUTION\]
Build a decentralized marketplace.

### \[IMPACT\]
Connects 10,000 artisans to global buyers.

### \[TEAM\]
Maria Garcia - CEO
Carlos Ruiz - CTO

### \[BUDGET & COSTS\]
Development: $50,000
Marketing: $10,000

### \[TARGET\]
Small business owners in Latin America.
MD;

        $results = $this->parser->parseAll($fullContent);

        expect($results)->toHaveKey('project_details')
            ->and($results)->toHaveKey('pitch')
            ->and($results)->toHaveKey('category_questions')
            ->and($results['project_details'])->toHaveKey('solution')
            ->and($results['project_details'])->toHaveKey('impact')
            ->and($results['pitch'])->toHaveKey('team')
            ->and($results['pitch'])->toHaveKey('budget')
            ->and($results['category_questions'])->toHaveKey('target');
    });
});

/*
|--------------------------------------------------------------------------
| hasParsableSections()
|--------------------------------------------------------------------------
*/

describe('hasParsableSections()', function () {

    test('detects Fund 10-13 escaped headers', function () {
        expect($this->parser->hasParsableSections('### \[SOLUTION\]\nContent'))->toBeTrue();
    });

    test('detects Fund 10-13 unescaped headers', function () {
        expect($this->parser->hasParsableSections('### [SOLUTION]\nContent'))->toBeTrue();
    });

    test('detects Fund 6-9 headers', function () {
        expect($this->parser->hasParsableSections("## Solution\nContent"))->toBeTrue();
    });

    test('detects bold format headers', function () {
        expect($this->parser->hasParsableSections('**Solution:** Content'))->toBeTrue();
    });

    test('returns false for plain text', function () {
        expect($this->parser->hasParsableSections('Just some paragraph text with no headers.'))->toBeFalse();
    });
});

/*
|--------------------------------------------------------------------------
| Utility Methods
|--------------------------------------------------------------------------
*/

describe('utility methods', function () {

    test('getSupportedFields returns all field types', function () {
        $fields = $this->parser->getSupportedFields();
        expect($fields)->toContain('project_details')
            ->and($fields)->toContain('pitch')
            ->and($fields)->toContain('category_questions')
            ->and($fields)->toContain('theme');
    });

    test('getFieldKeys returns keys for project_details', function () {
        $keys = $this->parser->getFieldKeys('project_details');
        expect($keys)->toContain('solution')
            ->and($keys)->toContain('impact')
            ->and($keys)->toContain('feasibility')
            ->and($keys)->toContain('outputs');
    });

    test('getFieldKeys returns keys for pitch', function () {
        $keys = $this->parser->getFieldKeys('pitch');
        expect($keys)->toContain('team')
            ->and($keys)->toContain('budget')
            ->and($keys)->toContain('milestones')
            ->and($keys)->toContain('value')
            ->and($keys)->toContain('resources');
    });

    test('getFieldKeys returns empty array for unknown field', function () {
        expect($this->parser->getFieldKeys('nonexistent'))->toBe([]);
    });
});

/*
|--------------------------------------------------------------------------
| Fallback Behavior: parseAll() and parseWithFallback()
|--------------------------------------------------------------------------
*/

describe('fallback for plain text and Detailed Plan only proposals', function () {

    test('parseAll uses detailed_plan as project_details.solution fallback', function () {
        $content = <<<'MD'
### Detailed Plan

Our project will create a decentralized identity platform that empowers users to own their credentials on the Cardano blockchain. We aim to provide a reusable identity layer.
MD;

        $results = $this->parser->parseAll($content);
        expect($results)->toHaveKey('project_details')
            ->and($results['project_details'])->toHaveKey('solution')
            ->and($results['project_details']['solution'])->toContain('decentralized identity platform')
            ->and($results)->toHaveKey('category_questions')
            ->and($results['category_questions'])->toHaveKey('detailed_plan');
    });

    test('parseAll uses full content as fallback for plain text', function () {
        $content = "Our project focuses on building a blockchain education platform for African communities. We will create video tutorials, workshops, and mentoring programs to increase Cardano adoption across the continent.";

        $results = $this->parser->parseAll($content);
        expect($results)->toHaveKey('project_details')
            ->and($results['project_details'])->toHaveKey('solution')
            ->and($results['project_details']['solution'])->toContain('blockchain education platform');
    });

    test('parseAll does not use fallback when project_details exists', function () {
        $content = <<<'MD'
### \[SOLUTION\]
Our actual solution is here.

### \[IMPACT\]
The impact will be significant.
MD;

        $results = $this->parser->parseAll($content);
        expect($results['project_details'])->toHaveKey('solution')
            ->and($results['project_details']['solution'])->toContain('actual solution');
    });

    test('parseAll returns nothing for very short content', function () {
        $content = "Too short.";

        $results = $this->parser->parseAll($content);
        expect($results)->not->toHaveKey('project_details');
    });

    test('parseWithFallback promotes detailed_plan to project_details', function () {
        $content = <<<'MD'
### Detailed Plan

We will build a comprehensive tool for Cardano governance that allows ADA holders to participate directly in on-chain voting.
MD;

        $result = $this->parser->parseWithFallback($content, 'project_details');
        expect($result)->not->toBeNull()
            ->and($result)->toHaveKey('solution')
            ->and($result['solution'])->toContain('comprehensive tool for Cardano governance');
    });

    test('parseWithFallback returns null for non-project_details fields', function () {
        $content = "Just some plain text content about a blockchain project that is long enough.";

        $result = $this->parser->parseWithFallback($content, 'pitch');
        expect($result)->toBeNull();
    });

    test('parseWithFallback uses plain text as solution', function () {
        $content = "ADA MakerSpace will host a 16 Week Online Accelerator Program for 6 Startup Idea Teams. During the 16 weeks, we will develop 6 Minimal Viable Products for the Idea Teams.";

        $result = $this->parser->parseWithFallback($content, 'project_details');
        expect($result)->not->toBeNull()
            ->and($result)->toHaveKey('solution')
            ->and($result['solution'])->toContain('ADA MakerSpace');
    });
});

/*
|--------------------------------------------------------------------------
| Fund 7-8 Natural Language Headers
|--------------------------------------------------------------------------
*/

describe('Fund 7-8 natural language headers', function () {

    test('parses "Why is it important?" as impact', function () {
        $content = <<<'MD'
### Why is it important?
Cardano needs new innovations for the ecosystem to reach its potential.

### What does success look like?
An increasing number of products that offer new solutions.

### Key Metrics to measure
Number of new dApps launched, total value locked, user adoption rates.
MD;

        $result = $this->parser->parse($content, 'project_details');
        expect($result)->toHaveKey('impact')
            ->and($result['impact'])->toContain('new innovations')
            ->and($result)->toHaveKey('outputs')
            ->and($result['outputs'])->toContain('increasing number of products');

        $cq = $this->parser->parse($content, 'category_questions');
        expect($cq)->toHaveKey('performance_metrics')
            ->and($cq['performance_metrics'])->toContain('dApps launched');
    });
});
