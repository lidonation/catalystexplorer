<?php

declare(strict_types=1);

namespace App\Http\Integrations\CatalystGateway\Requests;

use Saloon\Enums\Method;
use Saloon\Http\Request;

class GetDocumentRequest extends Request
{
    /**
     * The HTTP method of the request
     */
    protected Method $method = Method::GET;

    public function __construct(
        public string $documentId,
        public ?string $version = null
    ) {}

    /**
     * The endpoint for the request
     */
    public function resolveEndpoint(): string
    {
        return "/v1/document/{$this->documentId}";
    }

    /**
     * Query parameters for the request
     */
    protected function defaultQuery(): array
    {
        $query = [];

        if ($this->version) {
            $query['version'] = $this->version;
        }

        return $query;
    }
}
