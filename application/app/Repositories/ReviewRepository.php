<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Review;
use Laravel\Scout\Builder;
use Meilisearch\Endpoints\Indexes;

class ReviewRepository extends Repository
{
    public function __construct(Review $model)
    {
        parent::__construct($model);
    }

    public function search(string $term, array $args = []): Builder
    {
        $searchTerm = (strtolower($term) === 'reviews') ? 'review' : $term;

        return Review::search(
            $searchTerm,
            function (Indexes $index, $query) use ($args) {
                $args = array_merge(
                    [
                        'attributesToRetrieve' => [
                            'hash',
                            'title',
                            'content',
                            'model_type',
                            'reviewer',
                            'rating',
                            'positive_rankings',
                            'negative_rankings',
                            'status',
                            'proposal',
                            'created_at',
                        ],
                        'facets' => [
                            'rating',
                            'status',
                            'reviewer.avg_reputation_score',
                        ],
                    ],
                    $args
                );

                return $index->search($query, $args);
            }
        );
    }

    public function countSearchResults(string $term, array $args = []): int
    {
        try {
            $rawResults = $this->search($term)->raw();

            if (is_array($rawResults)) {
                return $rawResults['estimatedTotalHits'] ?? $rawResults['nbHits'] ?? 0;
            } elseif (is_object($rawResults) && method_exists($rawResults, 'getEstimatedTotalHits')) {
                return $rawResults->getEstimatedTotalHits();
            }

            return 0;
        } catch (\Exception $e) {
            return 0;
        }
    }
}
