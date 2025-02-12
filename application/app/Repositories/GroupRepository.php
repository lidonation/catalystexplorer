<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Group;
use Laravel\Scout\Builder;
use Meilisearch\Endpoints\Indexes;

class GroupRepository extends Repository
{
    public function __construct(Group $model)
    {
        parent::__construct($model);
    }

    public function search(string $term, array $args = []): Builder
    {
        return Group::search(
            $term,
            function (Indexes $index, $query) use ($args) {
                $args = array_merge(
                    [
                        'attributesToRetrieve' => [
                            'slug',
                            'name',
                            'discord',
                            'twitter',
                            'website',
                            'github',
                            'link',
                            'amount_received',
                            'thumbnail_url',
                            'amount_awarded_ada',
                            'amount_awarded_usd',
                            'gravatar',
                            'proposals_count',
                            'completed_proposals_count',
                            'funded_proposals_count',
                            'unfunded_proposals_count',
                            'proposals_funded',
                            'profile_photo_url',
                            'amount_distributed_ada',
                            'amount_distributed_usd',
                            'amount_requested_usd',
                            'amount_requested_ada',
                            'ideascale_profiles',
                        ],
                        'facets' => [
                            'tags.id',
                            'proposals.fund.title',
                            'amount_awarded_ada',
                            'amount_awarded_usd'
                        ],
                    ],
                    $args
                );

                return $index->search($query, $args);
            }
        );
    }
}
