<?php

declare(strict_types=1);

namespace App\Http\Integrations\LidoNation\Requests;

use App\Http\Integrations\LidoNation\LidoNationConnector;
use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Connector;
use Saloon\Http\Request;
use Saloon\PaginationPlugin\Contracts\Paginatable;
use Saloon\Traits\Body\HasJsonBody;
use Saloon\Traits\Request\HasConnector;

class GetPostsRequest extends Request implements HasBody, Paginatable
{
    use HasConnector, HasJsonBody;

    /**
     * The HTTP method of the request
     */
    protected Method $method = Method::GET;

    public function resolveConnector(): Connector
    {
        return app(LidoNationConnector::class);
    }

    public function resolveEndpoint(): string
    {
        return '/posts';
    }
}
