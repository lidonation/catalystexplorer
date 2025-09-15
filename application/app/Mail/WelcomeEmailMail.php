<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeEmailMail extends LocalizableMailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public User $user,
    ) {
        $this->user = $user;
    }

    /**
     * Build the envelope with proper localization
     */
    protected function buildEnvelope(): Envelope
    {
        return new Envelope(
            subject: __('emails.welcome.title'),
        );
    }

    /**
     * Build the content with proper localization
     */
    protected function buildContent(): Content
    {
        return new Content(
            view: 'emails.welcome',
            with: [
                'user' => $this->user,
            ],
        );
    }
}
