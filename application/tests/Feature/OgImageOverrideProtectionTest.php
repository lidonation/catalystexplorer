<?php

declare(strict_types=1);

use App\Models\Proposal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
});

describe('Get Request Cache Protection', function () {
    it('serves cached image on GET request without modification', function () {

        $proposal = Proposal::factory()->create(['slug' => 'test-cached-proposal']);
        $imagePath = "og-images/{$proposal->slug}.png";
        $customImageContent = 'custom-png-content-from-dashboard-post';

        Storage::disk()->put($imagePath, $customImageContent, 'public');

        $response = $this->get(route('proposals.og-image', ['slug' => $proposal->slug]));

        $response->assertStatus(200);
        expect($response->getContent())->toBe($customImageContent);

        $currentContent = Storage::disk()->get($imagePath);
        expect($currentContent)->toBe($customImageContent);
    });

    it('returns correct headers on GET request for cached image', function () {
        $proposal = Proposal::factory()->create(['slug' => 'test-headers']);
        $imagePath = "og-images/{$proposal->slug}.png";
        Storage::disk()->put($imagePath, 'cached-image-content', 'public');

        $response = $this->get(route('proposals.og-image', ['slug' => $proposal->slug]));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'image/png');
        expect($response->headers->get('Cache-Control'))->toContain('max-age=3600');
        expect($response->headers->get('Cache-Control'))->toContain('public');
        expect($response->headers->get('ETag'))->not->toBeNull();
        expect($response->headers->get('Last-Modified'))->not->toBeNull();
    });


    it('does not regenerate image when cached image exists on GET request', function () {
        $proposal = Proposal::factory()->create(['slug' => 'no-regen-test']);
        $imagePath = "og-images/{$proposal->slug}.png";
        $cachedContent = 'original-cached-content-should-persist';

        Storage::disk()->put($imagePath, $cachedContent, 'public');

        $response1 = $this->get(route('proposals.og-image', ['slug' => $proposal->slug]));
        $response2 = $this->get(route('proposals.og-image', ['slug' => $proposal->slug]));
        $response3 = $this->get(route('proposals.og-image', ['slug' => $proposal->slug]));

        expect($response1->getContent())->toBe($cachedContent);
        expect($response2->getContent())->toBe($cachedContent);
        expect($response3->getContent())->toBe($cachedContent);

        expect(Storage::disk()->get($imagePath))->toBe($cachedContent);
    });
});


describe('POST Custom Image Preservation', function () {
    it('preserves POST-saved image when accessed via GET', function () {

        $proposal = Proposal::factory()->create(['slug' => 'preserve-post-image']);
        $imagePath = "og-images/{$proposal->slug}.png";

        $customImageContent = 'custom-og-image-with-magenta-theme-and-vote-badge';
        Storage::disk()->put($imagePath, $customImageContent, 'public');

        $originalHash = hash('sha256', $customImageContent);

        $response = $this->get(route('proposals.og-image', ['slug' => $proposal->slug]));

        $response->assertStatus(200);
        expect($response->getContent())->toBe($customImageContent);

        $storedContent = Storage::disk()->get($imagePath);
        $currentHash = hash('sha256', $storedContent);
        expect($currentHash)->toBe($originalHash);
    });

    it('multiple GET requests do not degrade custom image', function () {
        $proposal = Proposal::factory()->create(['slug' => 'multi-get-test']);
        $imagePath = "og-images/{$proposal->slug}.png";
        $customContent = 'custom-high-quality-og-image-content';

        Storage::disk()->put($imagePath, $customContent, 'public');

        for ($i = 0; $i < 10; $i++) {
            $response = $this->get(route('proposals.og-image', ['slug' => $proposal->slug]));
            expect($response->getContent())->toBe($customContent);
        }

        expect(Storage::disk()->get($imagePath))->toBe($customContent);
    });
});

describe('Route Behavior', function () {
    
    it('route serves cached image correctly', function () {
        $proposal = Proposal::factory()->create(['slug' => 'non-localized-test']);
        $imagePath = "og-images/{$proposal->slug}.png";
        $content = 'cached-via-direct-route';

        Storage::disk()->put($imagePath, $content, 'public');

        $response = $this->get(route('proposals.og-image', ['slug' => $proposal->slug]));

        $response->assertStatus(200);
        expect($response->getContent())->toBe($content);
    });
});

describe('Proposal Isolation', function () {
    it('different proposals have isolated OG image caches', function () {
        $proposalA = Proposal::factory()->create(['slug' => 'proposal-a-isolation']);
        $proposalB = Proposal::factory()->create(['slug' => 'proposal-b-isolation']);

        $contentA = 'proposal-a-custom-image-content';
        $contentB = 'proposal-b-custom-image-content';

        Storage::disk()->put("og-images/{$proposalA->slug}.png", $contentA, 'public');
        Storage::disk()->put("og-images/{$proposalB->slug}.png", $contentB, 'public');

        $responseA = $this->get(route('proposals.og-image', ['slug' => $proposalA->slug]));
        $responseB = $this->get(route('proposals.og-image', ['slug' => $proposalB->slug]));

        expect($responseA->getContent())->toBe($contentA);
        expect($responseB->getContent())->toBe($contentB);
        expect($responseA->getContent())->not->toBe($contentB);
        expect($responseB->getContent())->not->toBe($contentA);
    });

    it('accessing one proposal OG image does not modify another', function () {
        $proposalA = Proposal::factory()->create(['slug' => 'cross-access-a']);
        $proposalB = Proposal::factory()->create(['slug' => 'cross-access-b']);

        $contentA = 'proposal-a-original-content';
        $contentB = 'proposal-b-original-content';

        Storage::disk()->put("og-images/{$proposalA->slug}.png", $contentA, 'public');
        Storage::disk()->put("og-images/{$proposalB->slug}.png", $contentB, 'public');

        $this->get(route('proposals.og-image', ['slug' => $proposalA->slug]));
        $this->get(route('proposals.og-image', ['slug' => $proposalB->slug]));

        $responseA = $this->get(route('proposals.og-image', ['slug' => $proposalA->slug]));

        expect($responseA->getContent())->toBe($contentA);
        expect(Storage::disk()->get("og-images/{$proposalA->slug}.png"))->toBe($contentA);
    });
});

describe('Content Integrity', function () {

    it('preserves binary PNG content integrity on GET request', function () {
        $proposal = Proposal::factory()->create(['slug' => 'binary-integrity-test']);

        $pngSignature = "\x89PNG\r\n\x1a\n";
        $mockPngContent = $pngSignature . str_repeat("\x00", 100);

        Storage::disk()->put("og-images/{$proposal->slug}.png", $mockPngContent, 'public');

        $response = $this->get(route('proposals.og-image', ['slug' => $proposal->slug]));

        expect($response->getContent())->toBe($mockPngContent);
        expect(strlen($response->getContent()))->toBe(strlen($mockPngContent));
    });
});
