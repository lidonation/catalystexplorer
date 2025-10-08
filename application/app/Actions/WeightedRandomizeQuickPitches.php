<?php

declare(strict_types=1);

namespace App\Actions;

use Illuminate\Support\Collection;

final class WeightedRandomizeQuickPitches
{
    /**
     * Apply weighted randomization to proposals, favoring those with shorter quickpitch_length values
     *
     * @param  Collection  $proposals  The proposals collection to randomize
     * @param  int  $limit  The maximum number of proposals to return (default: 15)
     * @return Collection The weighted randomized proposals
     */
    public function __invoke(Collection $proposals, int $limit = 15): Collection
    {
        if ($proposals->isEmpty()) {
            return collect([]);
        }

        // Apply weighted randomization favoring shorter videos
        $shuffledProposals = $this->weightedShuffleByQuickpitchLength($proposals);

        // Limit the results after shuffling
        return $shuffledProposals->take($limit);
    }

    /**
     * Weighted shuffle that favors proposals with shorter quickpitch_length values
     */
    private function weightedShuffleByQuickpitchLength(Collection $proposals): Collection
    {
        if ($proposals->isEmpty()) {
            return collect([]);
        }

        // Separate proposals with and without quickpitch_length
        $proposalsWithLength = $proposals->filter(fn ($proposal) => ! is_null($proposal->quickpitch_length));
        $proposalsWithoutLength = $proposals->filter(fn ($proposal) => is_null($proposal->quickpitch_length));

        // If no proposals have length data, just return a random shuffle
        if ($proposalsWithLength->isEmpty()) {
            return $proposals->shuffle();
        }

        // Calculate weights for proposals with length data
        // Lower duration = higher weight (inverted scoring)
        $maxLength = $proposalsWithLength->max('quickpitch_length');
        $minLength = $proposalsWithLength->min('quickpitch_length');

        // Avoid division by zero
        $range = $maxLength - $minLength;
        if ($range == 0) {
            $range = 1;
        }

        $weightedProposals = [];

        // Create weighted array for proposals with length
        foreach ($proposalsWithLength as $proposal) {
            // Invert the weight: shorter videos get higher weights
            // Formula: (max - current) / range + 1 (to ensure minimum weight of 1)
            $normalizedWeight = ($maxLength - $proposal->quickpitch_length) / $range;
            // Scale weight: shorter videos get 3x more weight than longer ones
            $weight = (int) round(($normalizedWeight * 2 + 1) * 10); // Scale by 10 for better granularity

            // Add proposal multiple times based on weight
            for ($i = 0; $i < $weight; $i++) {
                $weightedProposals[] = $proposal;
            }
        }

        // Shuffle the weighted array using Laravel's Collection method
        $weightedProposals = collect($weightedProposals)->shuffle()->toArray();

        // Remove duplicates while preserving the weighted randomization order
        $uniqueWeightedProposals = collect([]);
        $seenIds = [];

        foreach ($weightedProposals as $proposal) {
            if (! in_array($proposal->id, $seenIds)) {
                $uniqueWeightedProposals->push($proposal);
                $seenIds[] = $proposal->id;
            }
        }

        // Add proposals without length data at random positions
        $shuffledWithoutLength = $proposalsWithoutLength->shuffle();

        // Merge the two groups with some randomization
        $finalResult = collect([]);
        $withLengthIndex = 0;
        $withoutLengthIndex = 0;

        $totalCount = $uniqueWeightedProposals->count() + $shuffledWithoutLength->count();

        for ($i = 0; $i < $totalCount; $i++) {
            // Favor weighted proposals (70% chance) but still include others
            $useWeighted = (random_int(1, 100) <= 70) && ($withLengthIndex < $uniqueWeightedProposals->count());

            if ($useWeighted) {
                $finalResult->push($uniqueWeightedProposals[$withLengthIndex]);
                $withLengthIndex++;
            } elseif ($withoutLengthIndex < $shuffledWithoutLength->count()) {
                $finalResult->push($shuffledWithoutLength[$withoutLengthIndex]);
                $withoutLengthIndex++;
            } elseif ($withLengthIndex < $uniqueWeightedProposals->count()) {
                // Fallback: add remaining weighted proposals
                $finalResult->push($uniqueWeightedProposals[$withLengthIndex]);
                $withLengthIndex++;
            }
        }

        return $finalResult;
    }
}
