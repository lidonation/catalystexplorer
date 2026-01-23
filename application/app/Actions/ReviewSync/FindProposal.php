<?php

declare(strict_types=1);

namespace App\Actions\ReviewSync;

use App\Models\Proposal;

class FindProposal
{
    public function __invoke(array $reviewData, string $fundId): ?Proposal
    {
        $prId = $reviewData['proposal']['pr_id'] ?? null;
        $title = $reviewData['proposal']['title'] ?? null;

        // First, try to find by catalyst_document_id in meta_info
        if ($prId) {
            $proposal = Proposal::whereHas('metas', function ($query) use ($prId) {
                $query->where('key', 'catalyst_document_id')
                    ->where('content', $prId);
            })->first();

            if ($proposal) {
                return $proposal;
            }
        }

        // Fallback: Find by title and fund_id
        // Title is stored as JSON, so we need to search within the JSON structure
        if ($title) {
            // Normalize the search title for fuzzy matching
            $normalizedTitle = preg_replace('/[^a-z0-9]/i', '', strtolower(trim($title)));

            // 1) Try within the given fund
            $proposal = Proposal::where('fund_id', $fundId)
                ->where(function ($query) use ($title, $normalizedTitle) {
                    // Exact match on JSON 'en'
                    $query->whereRaw("title->>'en' = ?", [$title])
                        // Case-insensitive contains
                        ->orWhereRaw("LOWER(title->>'en') ILIKE ?", ['%'.strtolower($title).'%'])
                        // Normalized equality (remove punctuation/whitespace)
                        ->orWhereRaw(
                            "regexp_replace(LOWER(title->>'en'), '[^a-z0-9]', '', 'g') = ?",
                            [$normalizedTitle]
                        );
                })
                ->first();

            if ($proposal) {
                return $proposal;
            }

            // 2) Broaden search across all funds (in case the provided fund_id doesn't match)
            $proposal = Proposal::where(function ($query) use ($title, $normalizedTitle) {
                $query->whereRaw("title->>'en' = ?", [$title])
                    ->orWhereRaw("LOWER(title->>'en') ILIKE ?", ['%'.strtolower($title).'%'])
                    ->orWhereRaw(
                        "regexp_replace(LOWER(title->>'en'), '[^a-z0-9]', '', 'g') = ?",
                        [$normalizedTitle]
                    );
            })
                ->first();

            if ($proposal) {
                return $proposal;
            }
        }

        return null;
    }
}
