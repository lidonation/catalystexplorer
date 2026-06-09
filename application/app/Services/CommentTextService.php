<?php

declare(strict_types=1);

namespace App\Services;

use League\CommonMark\Extension\DisallowedRawHtml\DisallowedRawHtmlExtension;
use Spatie\LaravelMarkdown\MarkdownRenderer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

class CommentTextService
{
    public function __construct(protected MarkdownRenderer $markdownRenderer) {}

    /**
     * Convert a comment's raw markdown into sanitized HTML.
     */
    public function process(?string $originalText): string
    {
        $html = $this->markdownRenderer
            ->addExtension(new DisallowedRawHtmlExtension)
            ->toHtml($originalText ?? '');

        return $this->sanitize($html);
    }

    public function sanitize(string $html): string
    {
        $config = (new HtmlSanitizerConfig)
            ->allowRelativeLinks()
            ->allowRelativeMedias()
            ->allowSafeElements()
            ->allowElement('span', ['data-mention', 'class']);

        return (new HtmlSanitizer($config))->sanitize($html);
    }
}
