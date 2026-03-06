<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\VoteEnum;
use App\Models\BookmarkCollection;
use App\Models\ModelEmbedding;
use App\Models\Proposal;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ProposalPredictionService
{
    public function __construct(
        private EmbeddingService $embeddingService
    ) {}

    /**
     * Get AI-powered proposal recommendations based on user swipe history
     */
    public function getRecommendedProposals(
        ?BookmarkCollection $leftBookmarkCollection = null,
        ?BookmarkCollection $rightBookmarkCollection = null,
        array $excludeProposalIds = [],
        array $excludeProposalSlugs = [],
        int $limit = 20
    ): array {
        $preferenceProfile = $this->buildUserPreferenceProfile(
            $leftBookmarkCollection,
            $rightBookmarkCollection
        );

        if (empty($preferenceProfile)) {
            return [];
        }

        $recommendations = $this->findSimilarProposals(
            $preferenceProfile,
            $excludeProposalIds,
            $excludeProposalSlugs,
            $limit * 2
        );

        $scoredRecommendations = $this->scoreRecommendations(
            $recommendations,
            $preferenceProfile
        );

        return array_slice($scoredRecommendations, 0, $limit);
    }

    /**
     * Build user preference profile from bookmark collections
     * Uses right swipes (liked) for preferences and left swipes (disliked) for avoidance
     */
    private function buildUserPreferenceProfile(
        ?BookmarkCollection $leftBookmarkCollection = null,
        ?BookmarkCollection $rightBookmarkCollection = null
    ): array {
        $likedProposals = [];
        $dislikedProposals = [];

        if ($rightBookmarkCollection) {
            $rightProposalIds = DB::table('bookmark_items')
                ->where('bookmark_collection_id', $rightBookmarkCollection->id)
                ->where('model_type', Proposal::class)
                ->where('vote', VoteEnum::YES->value)
                ->pluck('model_id')
                ->toArray();

            $likedProposals = $rightProposalIds;
        }

        if ($leftBookmarkCollection) {
            $leftProposalIds = DB::table('bookmark_items')
                ->where('bookmark_collection_id', $leftBookmarkCollection->id)
                ->where('model_type', Proposal::class)
                ->where('vote', VoteEnum::NO->value)
                ->pluck('model_id')
                ->toArray();

            $dislikedProposals = $leftProposalIds;
        }

        if (empty($likedProposals)) {
            return [];
        }

        $likedEmbeddings = $this->getProposalEmbeddings($likedProposals);
        $dislikedEmbeddings = $this->getProposalEmbeddings($dislikedProposals);

        if (empty($likedEmbeddings)) {
            return [];
        }

        $preferenceVector = $this->calculateCentroidEmbedding($likedEmbeddings);

        $avoidanceVector = null;
        if (! empty($dislikedEmbeddings)) {
            $avoidanceVector = $this->calculateCentroidEmbedding($dislikedEmbeddings);
        }

        return [
            'preference_vector' => $preferenceVector,
            'avoidance_vector' => $avoidanceVector,
            'liked_count' => count($likedProposals),
            'disliked_count' => count($dislikedProposals),
            'confidence' => min(count($likedProposals) / 3.0, 1.0),
        ];
    }

    /**
     * Get embeddings for given proposal IDs
     */
    private function getProposalEmbeddings(array $proposalIds): array
    {
        if (empty($proposalIds)) {
            return [];
        }

        return ModelEmbedding::where('embeddable_type', Proposal::class)
            ->whereIn('embeddable_id', $proposalIds)
            ->where('field_name', 'combined') // Use combined embeddings for best results
            ->whereNotNull('embedding')
            ->get()
            ->map(function ($embedding) {
                return [
                    'proposal_id' => $embedding->embeddable_id,
                    'embedding' => $embedding->getEmbeddingArray(),
                    'metadata' => $embedding->metadata ?? [],
                ];
            })
            ->toArray();
    }

    /**
     * Calculate centroid (average) embedding from multiple embeddings
     */
    private function calculateCentroidEmbedding(array $embeddings): array
    {
        if (empty($embeddings)) {
            return [];
        }

        $dimensions = count($embeddings[0]['embedding']);
        $centroid = array_fill(0, $dimensions, 0.0);

        foreach ($embeddings as $embeddingData) {
            $embedding = $embeddingData['embedding'];
            for ($i = 0; $i < $dimensions; $i++) {
                $centroid[$i] += $embedding[$i];
            }
        }

        // Average the vectors
        $count = count($embeddings);
        for ($i = 0; $i < $dimensions; $i++) {
            $centroid[$i] /= $count;
        }

        return $centroid;
    }

    /**
     * Find proposals similar to the preference profile
     */
    private function findSimilarProposals(
        array $preferenceProfile,
        array $excludeProposalIds,
        array $excludeProposalSlugs,
        int $limit
    ): Collection {
        $preferenceVector = $preferenceProfile['preference_vector'];

        if (empty($preferenceVector)) {
            return collect();
        }

        $query = ModelEmbedding::similarTo($preferenceVector, $limit, 0.5) // Lower threshold for more candidates
            ->where('embeddable_type', Proposal::class)
            ->where('field_name', 'combined')
            ->with(['embeddable.fund', 'embeddable.campaign']);

        if (! empty($excludeProposalIds)) {
            $query->whereNotIn('embeddable_id', $excludeProposalIds);
        }

        if (! empty($excludeProposalSlugs)) {
            $query->whereHas('embeddable', function ($q) use ($excludeProposalSlugs) {
                $q->whereNotIn('slug', $excludeProposalSlugs);
            });
        }

        return $query->get();
    }

    /**
     * Score and rank recommendations based on preference profile
     */
    private function scoreRecommendations(
        Collection $recommendations,
        array $preferenceProfile
    ): array {
        $preferenceVector = $preferenceProfile['preference_vector'];
        $avoidanceVector = $preferenceProfile['avoidance_vector'];
        $confidence = $preferenceProfile['confidence'];

        $scoredRecommendations = [];

        foreach ($recommendations as $modelEmbedding) {
            $proposal = $modelEmbedding->embeddable;
            $embedding = $modelEmbedding->getEmbeddingArray();

            if (! $proposal || empty($embedding)) {
                continue;
            }

            $preferenceSimilarity = $this->cosineSimilarity($embedding, $preferenceVector);

            $avoidanceSimilarity = 0;
            if ($avoidanceVector) {
                $avoidanceSimilarity = $this->cosineSimilarity($embedding, $avoidanceVector);
            }

            $score = $preferenceSimilarity;

            // Penalize proposals similar to disliked ones (stronger penalty)
            if ($avoidanceSimilarity > 0.6) {
                $score -= ($avoidanceSimilarity * 0.5);
            }

            $score *= $confidence;

            // Add randomness to avoid repetitive recommendations
            $randomness = (random_int(0, 100) / 1000);
            $score += $randomness;

            $scoredRecommendations[] = [
                'proposal_id' => $proposal->id,
                'proposal' => $proposal,
                'score' => $score,
                'preference_similarity' => $preferenceSimilarity,
                'avoidance_similarity' => $avoidanceSimilarity,
                'confidence' => $confidence,
            ];
        }

        usort($scoredRecommendations, function ($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        return $scoredRecommendations;
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private function cosineSimilarity(array $vectorA, array $vectorB): float
    {
        if (count($vectorA) !== count($vectorB)) {
            return 0;
        }

        $dotProduct = 0;
        $magnitudeA = 0;
        $magnitudeB = 0;

        for ($i = 0; $i < count($vectorA); $i++) {
            $dotProduct += $vectorA[$i] * $vectorB[$i];
            $magnitudeA += $vectorA[$i] * $vectorA[$i];
            $magnitudeB += $vectorB[$i] * $vectorB[$i];
        }

        $magnitudeA = sqrt($magnitudeA);
        $magnitudeB = sqrt($magnitudeB);

        if ($magnitudeA == 0 || $magnitudeB == 0) {
            return 0;
        }

        return $dotProduct / ($magnitudeA * $magnitudeB);
    }

    /**
     * Update proposal rankings in search results with AI predictions
     */
    public function enhanceSearchResults(
        array $searchResults,
        ?BookmarkCollection $leftBookmarkCollection = null,
        ?BookmarkCollection $rightBookmarkCollection = null
    ): array {
        $aiRecommendations = $this->getRecommendedProposals(
            $leftBookmarkCollection,
            $rightBookmarkCollection,
            [],
            [],
            count($searchResults) + 20
        );

        if (empty($aiRecommendations)) {
            return $searchResults;
        }

        $aiScores = [];
        foreach ($aiRecommendations as $recommendation) {
            $aiScores[$recommendation['proposal_id']] = $recommendation['score'];
        }

        foreach ($searchResults as &$result) {
            $proposalId = $result['id'] ?? null;
            if ($proposalId && isset($aiScores[$proposalId])) {
                $result['ai_score'] = $aiScores[$proposalId];
                // Boost ranking_total with AI score
                $result['ranking_total'] = ($result['ranking_total'] ?? 0) + ($aiScores[$proposalId] * 100);
            } else {
                $result['ai_score'] = 0;
            }
        }

        return $searchResults;
    }
}
