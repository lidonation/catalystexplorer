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
                            'funded_proposals_count',
                            'completed_proposals_count',
                            'own_proposals_count',
                            'collaborating_proposals_count',
                            'amount_requested_ada',
                            'amount_requested_usd',
                            'amount_awarded_ada',
                            'amount_awarded_usd',
                            'amount_distributed_ada',
                            'amount_distributed_usd',
                        ],
                    ],
                    $args
                );

                return $index->search($query, $args);
            }
        );
    }
}
