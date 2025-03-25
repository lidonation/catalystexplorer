<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\ProposalMilestone;
use Laravel\Scout\Builder;
use Meilisearch\Endpoints\Indexes;

class ProposalMilestoneRepository extends Repository
{
    public function __construct(ProposalMilestone $model)
    {
        parent::__construct($model);
    }

    public function search(string $term, array $args = []): Builder
    {
        return ProposalMilestone::search(
            $term,
            function (Indexes $index, $query) use ($args) {
                $args = array_merge(
                    [
                        'attributesToRetrieve' => [
                            'hash',
                            'title',
                            'url',
                            'proposal_id',
                            'project_id',
                            'created_at',
                            'budget',
                            'milestone_qty',
                            'funds_distributed',
                            'starting_date',
                            'currency',
                            'status',
                            'proposal',
                            'milestones'
                        ],
                    ],
                    $args
                );

                return $index->search($query, $args);
            }
        );
    }
}
