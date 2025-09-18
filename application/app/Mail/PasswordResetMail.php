<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends LocalizableMailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $resetUrl
    ) {
        $this->user = $user;
    }

    /**
     * Build the envelope with proper localization
     */
    protected function buildEnvelope(): Envelope
    {
        return new Envelope(
            subject: __('emails.password_reset.title'),
        );
    }

    /**
     * Build the content with proper localization
     */
    protected function buildContent(): Content
    {
        return new Content(
            view: 'emails.password-reset',
            with: [
                'user' => $this->user,
                'resetUrl' => $this->resetUrl,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
