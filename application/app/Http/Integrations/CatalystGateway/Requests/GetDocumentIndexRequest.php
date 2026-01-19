<?php

declare(strict_types=1);

namespace App\Http\Integrations\CatalystGateway\Requests;

use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasJsonBody;

class GetDocumentIndexRequest extends Request implements HasBody
{
    use HasJsonBody;

    /**
     * The HTTP method of the request
     */
    protected Method $method = Method::POST;

    public function __construct(
        public array $filters = [],
        public int $limit = 10,
        public int $offset = 0,
        public int $page = 0,
        public string $version = 'v2'
    ) {}

    /**
     * The endpoint for the request
     */
    public function resolveEndpoint(): string
    {
        return $this->version === 'v1' ? '/v1/document/index' : '/v2/document/index';
    }

    /**
     * Query parameters for the request
     */
    protected function defaultQuery(): array
    {
        if ($this->version === 'v1') {
            return [
                'page' => $this->page,
                'limit' => $this->limit,
            ];
        }

        return [
            'limit' => $this->limit,
            'offset' => $this->offset,
        ];
    }

    /**
     * Headers for the request
     */
    protected function defaultHeaders(): array
    {
        return [
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ];
    }

    /**
     * Request body
     */
    protected function defaultBody(): array
    {
        return $this->filters;
    }
}
