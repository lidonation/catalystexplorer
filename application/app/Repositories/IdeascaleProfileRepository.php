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
                            'ideascale_id',
                            'username',
                            'email',
                            'name',
                            'bio',
                            'created_at',
                            'updated_at',
                            'twitter',
                            'linkedin',
                            'discord',
                            'ideascale',
                            'claimed_by',
                            'telegram',
                            'title',
                            'profile_photo_url',
                            'proposals',
                            'proposals_completed',
                            'first_timer',
                            'proposals_funded',
                            'amount_awaraded_ada',
                            'amount_awaraded_usd',
                            'co_proposals_count',
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
