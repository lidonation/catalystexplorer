<?php

declare(strict_types=1);

namespace App\Actions\Ai;

use App\Models\Proposal;

class ExtractProposalTitle
{
    /**
     * Extract the title from a proposal, handling various data formats
     *
     * @param  string  $fallback  Default value when proposal is null or title is empty
     */
    public function __invoke(?Proposal $proposal, string $fallback = 'Untitled Proposal'): string
    {
        if (! $proposal) {
            return $fallback;
        }

        $title = $proposal->title;

        if (is_array($title)) {
            return $title['en'] ?? array_values($title)[0] ?? $fallback;
        }

        if (is_string($title)) {
            $decoded = json_decode($title, true);
            if (is_array($decoded)) {
                return $decoded['en'] ?? array_values($decoded)[0] ?? $fallback;
            }

            return trim($title) ?: $fallback;
        }

        return $fallback;
    }
}
