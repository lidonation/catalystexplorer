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
                            'id',
                            'hash',
                            'name',
                            'profile_photo_url',
                            'first_timer',
                            'completed_proposals_count',
                            'funded_proposals_count',
                            'unfunded_proposals_count',
                            'proposals_count',
                            'collaborating_proposals_count',
                            'own_proposals_count',
                            'amount_awarded_ada',
                            'amount_awarded_usd',
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
