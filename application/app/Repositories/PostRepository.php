<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Http\Intergrations\LidoNation\LidoNationConnector;
use App\Http\Intergrations\LidoNation\Requests\GetPostsRequest;
use App\Models\Fund;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Saloon\PaginationPlugin\PagedPaginator;

class PostRepository extends Repository
{
    public function __construct(Fund $model)
    {
        parent::__construct($model);
    }

    public function paginate($perPage = 4): LengthAwarePaginator|PagedPaginator
    {
        try {
            $connector = app(LidoNationConnector::class);
            $postRequest = app(GetPostsRequest::class);
            $postRequest->query()->merge($this->query);

            return $connector->paginate($postRequest)
                ->setPerPageLimit($perPage);
        } catch (\Throwable $e) {
            report($e);

            // Return an empty paginator manually
            return new \Illuminate\Pagination\LengthAwarePaginator(
                items: [],
                total: 0,
                perPage: $perPage,
                currentPage: request('page', 1),
                options: [
                    'path' => request()->url(),
                    'query' => request()->query(),
                ]
            );
        }
    }
}
