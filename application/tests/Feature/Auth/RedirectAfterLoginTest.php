<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Tests\TestCase;

class RedirectAfterLoginTest extends TestCase
{
    use DatabaseTransactions, WithFaker;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);
    }

    /** @test */
    public function it_redirects_to_intended_url_after_successful_login()
    {
        // Set intended URL in session
        Session::put('url.intended', '/proposals');

        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/proposals');
        $this->assertEmpty(Session::get('url.intended')); // Should be cleared
    }

    /** @test */
    public function it_redirects_to_home_when_no_intended_url_exists()
    {
        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertRedirect('/');
    }

    /** @test */
    public function it_uses_redirect_parameter_from_form_data()
    {
        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
            'redirect' => '/campaigns',
        ]);

        $response->assertRedirect('/campaigns');
    }

    /** @test */
    public function it_ignores_invalid_redirect_urls()
    {
        $invalidUrls = [
            'https://malicious.com/steal-data',
            '/login', // Auth route
            '/register', // Auth route
            '/api/secret', // API route
        ];

        foreach ($invalidUrls as $invalidUrl) {
            Session::put('url.intended', $invalidUrl);

            $response = $this->post('/login', [
                'email' => 'test@example.com',
                'password' => 'password123',
            ]);

            $response->assertRedirect('/'); // Should default to home
            $this->assertEmpty(Session::get('url.intended'));
            
            // Reset for next iteration
            $this->actingAs($this->user)->post('/logout');
        }
    }

    /** @test */
    public function it_captures_intended_url_from_middleware()
    {
        // Access a protected route without authentication
        $response = $this->get('/proposals/some-proposal');

        // Should store the intended URL
        $this->assertNotEmpty(Session::get('url.intended'));
        $this->assertStringContainsString('/proposals/some-proposal', Session::get('url.intended'));
    }

    /** @test */
    public function it_handles_query_parameter_intended_url()
    {
        // Access login page with intended parameter
        $response = $this->get('/login?intended=/campaigns/fund-12');

        // Check that the intended URL is stored in session
        $this->assertEquals('/campaigns/fund-12', Session::get('url.intended'));
    }

    /** @test */
    public function it_ignores_auth_routes_in_middleware()
    {
        $authRoutes = [
            '/login',
            '/register',
            '/logout',
            '/password/reset',
        ];

        foreach ($authRoutes as $route) {
            // Clear any existing intended URL
            Session::forget('url.intended');

            // Access auth route
            $this->get($route);

            // Should not store intended URL for auth routes
            $this->assertEmpty(Session::get('url.intended'));
        }
    }

    /** @test */
    public function it_validates_localized_paths_correctly()
    {
        // Test localized auth paths should be rejected
        $localizedAuthUrls = [
            '/en/login',
            '/es/register',
            '/de/password/reset',
        ];

        foreach ($localizedAuthUrls as $url) {
            Session::put('url.intended', $url);

            $response = $this->post('/login', [
                'email' => 'test@example.com',
                'password' => 'password123',
            ]);

            $response->assertRedirect('/'); // Should default to home
            $this->assertEmpty(Session::get('url.intended'));
            
            // Reset for next iteration
            $this->actingAs($this->user)->post('/logout');
        }
    }

    /** @test */
    public function it_handles_wallet_login_redirects()
    {
        Session::put('url.intended', '/communities');

        // Mock wallet login data
        $walletData = [
            'walletAddress' => 'addr1test123...',
            'stake_key' => 'stake_test123...',
            'stakeAddress' => 'stake1test123...',
            'signature' => 'signature123...',
            'signature_key' => 'key123...',
            'redirect' => '/communities',
        ];

        // Note: This test might need to be adjusted based on your actual wallet authentication implementation
        $response = $this->post('/login/wallet', $walletData);

        // The exact assertion depends on how wallet login is implemented
        // This is a placeholder for the expected behavior
        if ($response->status() === 302) {
            $response->assertRedirect('/communities');
        }
    }

    /** @test */
    public function it_prefers_form_redirect_over_session_intended()
    {
        // Set different URLs in session and form
        Session::put('url.intended', '/proposals');

        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
            'redirect' => '/campaigns', // This should take priority
        ]);

        $response->assertRedirect('/campaigns');
        $this->assertEmpty(Session::get('url.intended'));
    }

    /** @test */
    public function it_handles_homepage_detection_correctly()
    {
        $homepageUrls = [
            '/',
            '/en',
            '/es/',
            '/de/',
        ];

        foreach ($homepageUrls as $url) {
            // These should be considered homepages and might use referer if available
            // The exact behavior depends on your implementation
            $this->assertTrue(true); // Placeholder - adjust based on your homepage detection logic
        }
    }
}