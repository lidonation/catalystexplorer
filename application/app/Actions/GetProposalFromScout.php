<?php

declare(strict_types=1);

namespace App\Actions;

use App\DataTransferObjects\ProposalData;
use App\Repositories\ProposalRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;

class GetProposalFromScout
{
    public function __invoke(
        string $search,
        array &$filters,
        string|array &$sort = [],
        int $limit = 12,
        int $page = 1
    ): LengthAwarePaginator {
        $args = [
            'filter' => $filters,
            'limit' => $limit,
            'offset' => ($page - 1) * $limit,
        ];

        if (! empty($sort)) {
            [$field, $direction] = array_pad(explode(':', $sort), 2, 'asc');
            $args['sort'] = ["{$field}:{$direction}"];
        }

        $repository = app(ProposalRepository::class);
        $searchBuilder = $repository->search($search, $args);
        $response = new Fluent($searchBuilder->raw());

        return new LengthAwarePaginator(
            ProposalData::collect(collect($response->hits)->toArray()),
            $response->estimatedTotalHits,
            $args['limit'],
            $page,
            [
                'pageName' => 'p',
                'onEachSide' => 0,
            ]
        );
    }
}
