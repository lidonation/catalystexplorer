<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\User;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Facades\App;

abstract class LocalizableMailable extends Mailable
{
    protected User $user;

    protected string $originalLocale;

    /**
     * Get the message envelope with proper locale set
     */
    public function envelope(): Envelope
    {
        $this->setUserLocale();
        $envelope = $this->buildEnvelope();
        $this->restoreOriginalLocale();

        return $envelope;
    }

    /**
     * Get the message content with proper locale set
     */
    public function content(): Content
    {
        $this->setUserLocale();
        $content = $this->buildContent();
        $this->restoreOriginalLocale();

        return $content;
    }

    /**
     * Render the mailable with proper locale handling
     */
    public function render()
    {
        $this->setUserLocale();
        $result = parent::render();
        $this->restoreOriginalLocale();

        return $result;
    }

    /**
     * Build the message and set the locale based on user preference (for legacy support)
     */
    public function build()
    {
        $this->setUserLocale();
        $result = $this->buildMessage();
        $this->restoreOriginalLocale();

        return $result;
    }

    /**
     * Set the locale to user's preferred language
     */
    protected function setUserLocale(): void
    {
        $this->originalLocale = App::getLocale();
        App::setLocale($this->user->getPreferredLanguage());
    }

    /**
     * Restore the original locale
     */
    protected function restoreOriginalLocale(): void
    {
        App::setLocale($this->originalLocale);
    }

    /**
     * Override this method in child classes to define email envelope (new Laravel structure)
     */
    abstract protected function buildEnvelope(): Envelope;

    /**
     * Override this method in child classes to define email content (new Laravel structure)
     */
    abstract protected function buildContent(): Content;

    /**
     * Override this method in child classes to define email content (legacy support)
     */
    protected function buildMessage()
    {
        // Default implementation for backward compatibility
        return $this;
    }
}
