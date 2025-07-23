<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Http\Intergrations\LidoNation\LidoNationConnector;
use App\Http\Intergrations\LidoNation\Requests\GetPostsRequest;
use App\Models\Fund;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException as GuzzleRequestException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Saloon\Exceptions\Request\FatalRequestException;
use Saloon\Exceptions\Request\RequestException;
use Saloon\Exceptions\SaloonException;
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

            $postRequest->query()->merge($this->query ?? []);

            return $connector->paginate($postRequest)
                ->setPerPageLimit($perPage);
        } catch (ConnectException|GuzzleRequestException|RequestException|FatalRequestException|SaloonException $e) {
            Log::error('LidoNation API failed: '.$e->getMessage(), ['exception' => $e]);
        } catch (\Throwable $e) {
            report($e);
        }

        // Graceful fallback: return empty Laravel paginator
        return new \Illuminate\Pagination\LengthAwarePaginator(
            collect([]),
            0,
            $perPage,
            request('page', 1),
            [
                'path' => request()->url(),
                'query' => request()->query(),
            ]
        );
    }
}
