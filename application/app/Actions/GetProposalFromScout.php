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
        array &$sort = [],
        int $limit = 12,
        int $page = 1
    ): LengthAwarePaginator {
        if (! empty($sort)) {
            $sortParts = explode(':', $sort);
            $sortField = $sortParts[0];
            $sortDirection = $sortParts[1] ?? 'asc';
            $args['sort'] = ["{$sortField}:{$sortDirection}"];
        }

        $args = [
            'filter' => $filters,
            'limit' => $limit,
            'offset' => ($page - 1) * $limit,
        ];
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
