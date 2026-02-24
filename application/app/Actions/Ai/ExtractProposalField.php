<?php

declare(strict_types=1);

namespace App\Actions\Ai;

use App\Models\Proposal;

class ExtractProposalField
{
    /**
     * Extract a specific field from a proposal, handling various data formats
     *
     * @param  string  $field  The field name to extract
     * @param  int|null  $maxLength  Maximum length for the returned text (null for no limit)
     */
    public function __invoke(Proposal $proposal, string $field, ?int $maxLength = null): ?string
    {
        $value = $proposal->getAttribute($field);

        if (empty($value)) {
            return null;
        }

        $text = $this->extractText($value);

        if (! $text) {
            return null;
        }

        if ($maxLength && strlen($text) > $maxLength) {
            return substr($text, 0, $maxLength - 3).'...';
        }

        return $text;
    }

    /**
     * Extract text from various data formats
     *
     * @param  mixed  $value
     */
    private function extractText($value): ?string
    {
        if (is_array($value)) {
            $text = $value['en'] ?? array_values($value)[0] ?? '';
        } elseif (is_string($value)) {
            $decoded = json_decode($value, true);
            if (is_array($decoded)) {
                $text = $decoded['en'] ?? array_values($decoded)[0] ?? '';
            } else {
                $text = $value;
            }
        } else {
            $text = (string) $value;
        }

        return trim($text) ?: null;
    }
}
