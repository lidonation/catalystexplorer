<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Interfaces\Http\Intergrations\LidoNation\LidoNationConnector;
use App\Interfaces\Http\Intergrations\LidoNation\Requests\GetPostsRequest;
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
            $postRequest->query()
                ->merge($this->query);

            return $connector->paginate($postRequest)
                ->setPerPageLimit($perPage);
        } catch (\Exception $e) {
            report($e);
        }

        return new \Illuminate\Pagination\LengthAwarePaginator([], 0, $perPage);
    }
}
