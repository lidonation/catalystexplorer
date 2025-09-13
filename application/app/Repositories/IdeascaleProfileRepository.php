<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\IdeascaleProfile;
use Laravel\Scout\Builder;
use Meilisearch\Endpoints\Indexes;

class IdeascaleProfileRepository extends Repository
{
    public function __construct(IdeascaleProfile $model)
    {
        parent::__construct($model);
    }

    public function search(string $term, array $args = []): Builder
    {
        return IdeascaleProfile::search(
            $term,
            function (Indexes $index, $query) use ($args) {
                $args = array_merge(
                    [
                        'attributesToRetrieve' => [
                            'id', // Changed from 'hash' to use UUID
                            'name',
                            'username',
                            'email',
                            'hero_img_url',
                            'first_timer',
                            'claimed_by_uuid',
                            'completed_proposals_count',
                            'funded_proposals_count',
                            'unfunded_proposals_count',
                            'proposals_count', // This should now be calculated correctly
                            'collaborating_proposals_count',
                            'own_proposals_count',
                            'amount_awarded_ada',
                            'amount_awarded_usd',
                            'amount_requested_ada',
                            'amount_requested_usd',
                            'amount_distributed_ada',
                            'amount_distributed_usd',
                            'proposals_funded',
                            'proposals_total_amount_requested',
                        ],
                    ],
                    $args
                );

                return $index->search($query, $args);
            }
        );
    }
}
