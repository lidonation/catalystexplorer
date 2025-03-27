<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\ProjectSchedule;
use Laravel\Scout\Builder;
use Meilisearch\Endpoints\Indexes;

class ProjectScheduleRepository extends Repository
{
    public function __construct(ProjectSchedule $model)
    {
        parent::__construct($model);
    }

    public function search(string $term, array $args = []): Builder
    {
        return ProjectSchedule::search(
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
                            'milestone_count',
                            'funds_distributed',
                            'starting_date',
                            'currency',
                            'status',
                            'proposal',
                            'milestones',
                        ],
                    ],
                    $args
                );

                return $index->search($query, $args);
            }
        );
    }
}
