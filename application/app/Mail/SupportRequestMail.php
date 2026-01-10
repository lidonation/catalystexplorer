<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class SupportRequestMail extends Mailable
{
    public string $senderName;

    public string $senderEmail;

    public string $messageContent;

    /**
     * Create a new message instance.
     */
    public function __construct(
        string $senderName,
        string $senderEmail,
        string $messageContent
    ) {
        $this->senderName = $senderName;
        $this->senderEmail = $senderEmail;
        $this->messageContent = $messageContent;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            replyTo: [new Address($this->senderEmail, $this->senderName)],
            subject: 'Support Request from '.$this->senderName,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.support-request',
            with: [
                'senderName' => $this->senderName,
                'senderEmail' => $this->senderEmail,
                'messageContent' => $this->messageContent,
            ]
        );
    }
}
