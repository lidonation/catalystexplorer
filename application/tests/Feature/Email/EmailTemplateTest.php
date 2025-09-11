<?php

namespace Tests\Feature\Email;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

class EmailTemplateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Mock routes that are referenced in templates
        Route::get('/proposals', function () {})->name('proposals.index');
        Route::get('/funds', function () {})->name('funds.index');
        Route::get('/completed-projects-nfts', function () {})->name('completedProjectsNfts.index');
    }

    public function test_button_component_renders_with_default_values()
    {
        $view = view('emails.components.button', [
            'url' => 'https://example.com'
        ]);

        $html = $view->render();

        $this->assertStringContainsString('https://example.com', $html);
        $this->assertStringContainsString('Click Here', $html);
        $this->assertStringContainsString('#0891b2', $html);
        $this->assertStringContainsString('padding: 12px 30px', $html);
        $this->assertStringContainsString('border-radius: 8px', $html); 
    }

    public function test_button_component_renders_with_custom_styles()
    {
        $view = view('emails.components.button', [
            'url' => 'https://example.com',
            'text' => 'Custom Button',
            'preset' => 'footer',
            'styles' => [
                'background-color' => '#ff0000',
                'padding' => '10px 20px'
            ]
        ]);

        $html = $view->render();

        $this->assertStringContainsString('Custom Button', $html);
        $this->assertStringContainsString('#ff0000', $html);
        $this->assertStringContainsString('padding: 10px 20px', $html);
        $this->assertStringContainsString('border-radius: 73px', $html); // Footer preset border radius
    }

    public function test_button_component_handles_markdown_text()
    {
        $view = view('emails.components.button', [
            'url' => 'https://example.com',
            'text' => '**Bold Button**',
            'markdown' => true
        ]);

        $html = $view->render();

        $this->assertStringContainsString('<strong>Bold Button</strong>', $html);
    }

    public function test_greeting_component_renders_default_greeting()
    {
        $view = view('emails.components.greeting');

        $html = $view->render();

        $this->assertStringContainsString('Hello!', $html);
        $this->assertStringContainsString('class="text greeting"', $html);
    }

    public function test_greeting_component_renders_with_user_name()
    {
        $user = User::factory()->make(['name' => 'John Doe']);

        $view = view('emails.components.greeting', [
            'user' => $user
        ]);

        $html = $view->render();

        $this->assertStringContainsString('Hello, John Doe!', $html);
    }

    public function test_greeting_component_renders_custom_content()
    {
        $view = view('emails.components.greeting', [
            'content' => 'Welcome back, **valued customer**!'
        ]);

        $html = $view->render();

        $this->assertStringContainsString('<strong>valued customer</strong>', $html);
        $this->assertStringNotContainsString('Hello', $html);
    }

    public function test_text_block_component_renders_different_types()
    {
        $types = [
            'greeting' => 'greeting',
            'body' => 'body-text', 
            'signature' => 'signature'
        ];

        foreach ($types as $type => $expectedClass) {
            $view = view('emails.components.text-block', [
                'type' => $type,
                'content' => 'Test content for ' . $type
            ]);

            $html = $view->render();

            $this->assertStringContainsString("text $expectedClass", $html);
            $this->assertStringContainsString('Test content for ' . $type, $html);
        }
    }

    public function test_text_block_component_handles_markdown_content()
    {
        $view = view('emails.components.text-block', [
            'content' => 'This is **bold** and this is *italic*.'
        ]);

        $html = $view->render();

        $this->assertStringContainsString('<strong>bold</strong>', $html);
        $this->assertStringContainsString('<em>italic</em>', $html);
    }

    public function test_text_block_component_handles_html_content()
    {
        $htmlContent = '<p>This is <strong>HTML</strong> content.</p>';

        $view = view('emails.components.text-block', [
            'content' => $htmlContent
        ]);

        $html = $view->render();

        $this->assertStringContainsString($htmlContent, $html);
    }

    public function test_text_block_component_decodes_html_entities()
    {
        $view = view('emails.components.text-block', [
            'content' => 'Price: &pound;100 &amp; tax: &euro;20'
        ]);

        $html = $view->render();

        $this->assertStringContainsString('£100', $html);
        $this->assertStringContainsString('&', $html);
        $this->assertStringContainsString('€20', $html);
    }

    public function test_welcome_email_template_renders_correctly()
    {
        $user = User::factory()->make([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com'
        ]);

        // Mock the message object for the base layout
        $mockMessage = $this->createMock(\Illuminate\Mail\Message::class);
        $mockMessage->method('embed')->willReturn('cid:embedded-logo');

        $view = view('emails.welcome', [
            'user' => $user,
            'message' => $mockMessage
        ]);

        $html = $view->render();

        // Check greeting
        $this->assertStringContainsString('Hello, Jane Smith!', $html);
        
        // Check welcome content
        $this->assertStringContainsString('Thank you for signing up', $html);
        $this->assertStringContainsString('Catalyst Explorer', $html);
        
        // Check button
        $this->assertStringContainsString('Go to Dashboard', $html);
        $this->assertStringContainsString('/my/dashboard', $html);
        
        // Check signature
        $this->assertStringContainsString('Best regards', $html);
        $this->assertStringContainsString('The Catalyst Explorer Team', $html);
    }

    public function test_password_reset_email_template_renders_correctly()
    {
        $user = User::factory()->make([
            'name' => 'John Doe',
            'email' => 'john@example.com'
        ]);

        $resetUrl = 'https://example.com/reset-password/token123';

        // Mock the message object for the base layout
        $mockMessage = $this->createMock(\Illuminate\Mail\Message::class);
        $mockMessage->method('embed')->willReturn('cid:embedded-logo');

        $view = view('emails.password-reset', [
            'user' => $user,
            'resetUrl' => $resetUrl,
            'message' => $mockMessage
        ]);

        $html = $view->render();

        // Check greeting
        $this->assertStringContainsString('Hello, John Doe!', $html);
        
        // Check reset content
        $this->assertStringContainsString('password reset request', $html);
        
        // Check reset button
        $this->assertStringContainsString('Reset Password', $html);
        $this->assertStringContainsString($resetUrl, $html);
        
        // Check expiration notice
        $this->assertStringContainsString('60 minutes', $html);
        
        // Check signature with URL
        $this->assertStringContainsString('Best regards', $html);
        $this->assertStringContainsString('Catalyst Explorer Team', $html);
    }

    public function test_header_component_renders_logo()
    {
        // Mock the message object for embed functionality
        $mockMessage = $this->createMock(\Illuminate\Mail\Message::class);
        $mockMessage->expects($this->atLeastOnce())
                   ->method('embed')
                   ->willReturn('cid:embedded-logo');

        $view = view('emails.partials.header', [
            'message' => $mockMessage
        ]);

        $html = $view->render();

        $this->assertStringContainsString('logo-container', $html);
        $this->assertStringContainsString('Catalyst Explorer Logo', $html);
        $this->assertStringContainsString('logo-img', $html);
    }

    public function test_header_component_renders_custom_content()
    {
        $mockMessage = $this->createMock(\Illuminate\Mail\Message::class);
        $mockMessage->method('embed')->willReturn('cid:embedded-logo');

        $view = view('emails.partials.header', [
            'message' => $mockMessage,
            'headerContent' => 'This is **custom** header content.'
        ]);

        $html = $view->render();

        $this->assertStringContainsString('<strong>custom</strong>', $html);
        $this->assertStringContainsString('header-content', $html);
    }

    public function test_footer_component_renders_navigation_buttons()
    {
        $mockMessage = $this->createMock(\Illuminate\Mail\Message::class);
        $mockMessage->method('embed')->willReturn('cid:embedded-logo');

        $view = view('emails.partials.footer', [
            'message' => $mockMessage
        ]);

        $html = $view->render();

        // Check navigation buttons
        $this->assertStringContainsString('Proposals', $html);
        $this->assertStringContainsString('Funds', $html);
        $this->assertStringContainsString('Completion NFTs', $html);
        $this->assertStringContainsString('Catalyst Numbers', $html);
        
        // Check footer preset styles are applied
        $this->assertStringContainsString('border-radius: 73px', $html);
        $this->assertStringContainsString('padding: 5px 20px', $html);
    }

    public function test_footer_component_displays_user_email()
    {
        $mockMessage = $this->createMock(\Illuminate\Mail\Message::class);
        $mockMessage->method('embed')->willReturn('cid:embedded-logo');

        $user = User::factory()->make(['email' => 'test@example.com']);

        $view = view('emails.partials.footer', [
            'message' => $mockMessage,
            'user' => $user
        ]);

        $html = $view->render();

        $this->assertStringContainsString('test@example.com', $html);
        $this->assertStringContainsString('This message was sent to', $html);
    }

    public function test_footer_component_handles_different_user_formats()
    {
        $mockMessage = $this->createMock(\Illuminate\Mail\Message::class);
        $mockMessage->method('embed')->willReturn('cid:embedded-logo');

        // Test with array user
        $view = view('emails.partials.footer', [
            'message' => $mockMessage,
            'user' => ['email' => 'array@example.com']
        ]);

        $html = $view->render();
        $this->assertStringContainsString('array@example.com', $html);

        // Test with object user
        $user = (object) ['email' => 'object@example.com'];
        $view = view('emails.partials.footer', [
            'message' => $mockMessage,
            'user' => $user
        ]);

        $html = $view->render();
        $this->assertStringContainsString('object@example.com', $html);
    }

    public function test_footer_component_renders_custom_content()
    {
        $mockMessage = $this->createMock(\Illuminate\Mail\Message::class);
        $mockMessage->method('embed')->willReturn('cid:embedded-logo');

        $view = view('emails.partials.footer', [
            'message' => $mockMessage,
            'footerContent' => 'Custom **footer** content.',
            'unsubscribeText' => 'Click [here](https://example.com/unsubscribe) to unsubscribe.'
        ]);

        $html = $view->render();

        $this->assertStringContainsString('<strong>footer</strong>', $html);
        $this->assertStringContainsString('footer-custom-content', $html);
        $this->assertStringContainsString('https://example.com/unsubscribe', $html);
    }

    public function test_footer_component_displays_copyright_year()
    {
        $mockMessage = $this->createMock(\Illuminate\Mail\Message::class);
        $mockMessage->method('embed')->willReturn('cid:embedded-logo');

        $view = view('emails.partials.footer', [
            'message' => $mockMessage
        ]);

        $html = $view->render();

        $currentYear = date('Y');
        $this->assertStringContainsString("© $currentYear Catalyst Explorer", $html);
    }

    public function test_templates_handle_missing_user_gracefully()
    {
        // Mock the message object for the base layout
        $mockMessage = $this->createMock(\Illuminate\Mail\Message::class);
        $mockMessage->method('embed')->willReturn('cid:embedded-logo');

        // Test welcome email without user - provide null user explicitly
        $view = view('emails.welcome', [
            'user' => null,
            'message' => $mockMessage
        ]);
        $html = $view->render();
        $this->assertStringContainsString('Hello!', $html); // Default greeting

        // Test password reset without user - provide null user explicitly
        $view = view('emails.password-reset', [
            'user' => null,
            'resetUrl' => 'https://example.com/reset',
            'message' => $mockMessage
        ]);
        $html = $view->render();
        $this->assertStringContainsString('Hello!', $html); // Default greeting
    }

    public function test_button_component_preserves_url()
    {
        // Test that URLs are preserved as-is in the href attribute
        $testUrl = 'https://example.com/path?param=value';
        
        $view = view('emails.components.button', [
            'url' => $testUrl,
            'text' => 'Click Me'
        ]);

        $html = $view->render();

        // The URL should be preserved in the href attribute
        $this->assertStringContainsString($testUrl, $html);
        $this->assertStringContainsString('Click Me', $html);
    }

    public function test_button_component_handles_missing_parameters()
    {
        // Test button with only URL (minimum required)
        $view = view('emails.components.button', [
            'url' => 'https://example.com'
        ]);

        $html = $view->render();

        // Should use defaults
        $this->assertStringContainsString('Click Here', $html); // Default text
        $this->assertStringContainsString('#0891b2', $html); // Default color
        $this->assertStringContainsString('https://example.com', $html);
    }

    public function test_text_block_handles_null_content()
    {
        // Test with null content
        $view = view('emails.components.text-block', [
            'content' => null
        ]);

        $html = $view->render();
        
        // Should render empty div with proper class
        $this->assertStringContainsString('class="text body-text"', $html);
    }
}