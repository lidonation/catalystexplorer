<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\VoterHistory;
use Laravel\Scout\Builder;
use Meilisearch\Endpoints\Indexes;

class VoterHistoryRepository extends Repository
{
    public function __construct(VoterHistory $model)
    {
        parent::__construct($model);
    }
    
    public function search(string $term, array $args = []): Builder
    {
        return VoterHistory::Search(
            $term,
            function (Indexes $index, $query) use ($args) {
                $args = array_merge(
                    [
                        'attributesToRetrieve' => [
                            'stake_address',
                            'fragment_id',
                            'caster',
                            'raw_fragment',
                            'choice',
                        ],
                        'facets' => [
                            'choice',
                        ],
                    ],
                    $args
                );

                return $index->search($query, $args);
            }
        );
    }
}
