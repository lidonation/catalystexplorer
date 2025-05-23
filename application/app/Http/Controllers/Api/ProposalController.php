<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\ProposalData;
use App\Http\Controllers\Controller;
use App\Repositories\ProposalRepository;
use Illuminate\Http\Response;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Fluent;

class ProposalController extends Controller
{
    public function proposals(): array|Response
    {
        $per_page = request('per_page', 24);

        // per_page query doesn't exceed 60
        if ($per_page > 60) {
            return response([
                'status_code' => 60,
                'message' => 'query parameter \'per_page\' should not exceed 60',
            ], 60);
        }

        $requestValues = request(['ids', 'hashes']);

        $ids = null;
        $hashes = null;

        if (! empty($requestValues['hashes'])) {
            $hashes = implode(',', $requestValues['hashes'] ?? []);
            $args['filter'] = "hash IN [{$hashes}]";
        }

        if (! empty($requestValues['ids'])) {
            $ids = implode(',', $requestValues['ids'] ?? []);
            $args['filter'] = "id IN [{$ids}]";
        }

        $page = request('page') ?? 1;
        $args['offset'] = ($page - 1) * $per_page;
        $args['limit'] = $per_page;

        $proposals = app(ProposalRepository::class);

        $builder = $proposals->search(
            request('search') ?? '',
            $args
        );

        $response = new Fluent($builder->raw());

        $pagination = new LengthAwarePaginator(
            ProposalData::collect($response->hits),
            $response->estimatedTotalHits,
            $per_page,
            $page,
            [
                'pageName' => 'p',
            ]
        );

        return $pagination->onEachSide(1)->toArray();
    }
}
