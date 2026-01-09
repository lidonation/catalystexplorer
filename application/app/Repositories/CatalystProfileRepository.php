<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\CatalystProfile;
use Laravel\Scout\Builder;
use Meilisearch\Endpoints\Indexes;

class CatalystProfileRepository extends Repository
{
    public function __construct(CatalystProfile $model)
    {
        parent::__construct($model);
    }

    public function search(string $term, array $args = []): Builder
    {
        return CatalystProfile::search(
            $term,
            function (Indexes $index, $query) use ($args) {
                $args = array_merge(
                    [
                        'attributesToRetrieve' => [
                            'id',
                            'name',
                            'username',
                            'catalyst_id',
                            'claimed_by',
                            'hero_img_url',
                            'proposals_count',
                        ],
                    ],
                    $args
                );

                return $index->search($query, $args);
            }
        );
    }
}
