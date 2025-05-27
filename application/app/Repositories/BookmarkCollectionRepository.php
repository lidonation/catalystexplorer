<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\BookmarkCollection;
use App\Models\Review;
use Laravel\Scout\Builder;
use Meilisearch\Endpoints\Indexes;

class BookmarkCollectionRepository extends Repository
{
    public function __construct(Review $model)
    {
        parent::__construct($model);
    }

    public function search(string $term, array $args = []): Builder
    {

        return BookmarkCollection::search(
            $term,
            function (Indexes $index, $query) use ($args) {
                $args = array_merge(
                    [
                        'attributesToRetrieve' => [
                            'hash',
                            'title',
                            'content',
                            'updated_at',
                            'items',
                            // 'proposals',
                            // 'ideascale_profiles',
                            // 'groups',
                            // 'reviews',
                            // 'communities',
                            // 'comments',
                            'comments',
                            'types_count',
                            'items_count',
                            'rationale',
                            'color',
                            'amount_requested_USD',
                            'amount_received_ADA',
                            'amount_requested_ADA',
                            'amount_received_USD',
                            'author'
                        ],
                        'facets' => [],
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
