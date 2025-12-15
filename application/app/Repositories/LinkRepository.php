<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Link;
use Laravel\Scout\Builder;
use Meilisearch\Endpoints\Indexes;

class LinkRepository extends Repository
{
    public function __construct(Link $model)
    {
        parent::__construct($model);
    }

    public function search(string $term, array $args = []): Builder
    {
        $searchTerm = (strtolower($term) === 'links') ? 'link' : $term;

        return Link::search(
            $searchTerm,
            function (Indexes $index, $query) use ($args) {
                $args = array_merge(
                    [
                        'attributesToRetrieve' => [
                            'id',
                            'title',
                            'label',
                            'link',
                            'type',
                            'status',
                            'valid',
                            'order',
                            'model_type',
                            'model_id',
                            'proposal_data',
                            'service_data',
                            'created_at',
                            'updated_at',
                        ],
                        'facets' => [
                            'type',
                            'status',
                            'valid',
                            'model_type',
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
            $rawResults = $this->search($term, $args)->raw();

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
