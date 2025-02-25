<?php

declare(strict_types=1);

namespace App\Interfaces\Http\Intergrations\LidoNation;

use Saloon\Http\Connector;
use Saloon\Http\Request;
use Saloon\Http\Response;
use Saloon\PaginationPlugin\Contracts\HasPagination;
use Saloon\PaginationPlugin\PagedPaginator;

class LidoNationConnector extends Connector implements HasPagination
{
    public function resolveBaseUrl(): string
    {
        return config('services.lido.api_base_url');
    }

    public function defaultHeaders(): array
    {
        return [
            'X-LIDO_API_KEY' => config('services.lido.api_key'),
            'Accepts' => 'application/json',
        ];
    }

    public function paginate(Request $request): PagedPaginator
    {
        return new class(connector: $this, request: $request) extends PagedPaginator
        {
            protected function isLastPage(Response $response): bool
            {
                return is_null($response->json('next_page_url'));
            }

            protected function getPageItems(Response $response, Request $request): array
            {
                return $response->json('data');
            }

            protected function applyPagination(Request $request): Request
            {
                $request->query()->add('page', $this->currentPage);

                if (isset($this->perPageLimit)) {
                    $request->query()->add('limit', $this->perPageLimit);
                }

                return $request;
            }
        };
    }
}
