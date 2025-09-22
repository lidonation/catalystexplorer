<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\BookmarkCollection;
use App\Models\User;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Facades\URL;

class BookmarkCollectionInvitation extends LocalizableMailable
{
    public User $inviter;

    public User $invitedUser;

    public BookmarkCollection $bookmarkCollection;

    public string $token;

    /**
     * Create a new message instance.
     */
    public function __construct(
        User $inviter,
        User $invitedUser,
        BookmarkCollection $bookmarkCollection,
        string $token
    ) {
        $this->inviter = $inviter;
        $this->invitedUser = $invitedUser;
        $this->bookmarkCollection = $bookmarkCollection;
        $this->token = $token;
        $this->user = $invitedUser;
    }

    /**
     * Get the message envelope.
     */
    protected function buildEnvelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: __('emails.bookmark_invitation.subject', [
                'inviter_name' => $this->inviter->name,
                'collection_title' => $this->bookmarkCollection->title,
            ]),
        );
    }

    /**
     * Get the message content definition.
     */
    protected function buildContent(): Content
    {
        $acceptUrl = URL::temporarySignedRoute('workflows.acceptInvitation.index', now()
            ->addDays(30), [
                'token' => $this->token,
                'collection' => $this->bookmarkCollection->id,
            ]);

        return new Content(
            view: 'emails.bookmark-invitation',
            with: [
                'inviter' => $this->inviter,
                'invitedUser' => $this->invitedUser,
                'bookmarkCollection' => $this->bookmarkCollection,
                'acceptUrl' => $acceptUrl,
                // Don't pass user object to avoid policy issues in footer
                'user' => null,
                'logoUrl' => config('app.url').'/img/cx-nova-logo.png',
            ]
        );
    }
}
