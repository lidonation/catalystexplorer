<?php

declare(strict_types=1);

namespace App\Http\Integrations\LidoNation\Requests;

use App\Http\Integrations\LidoNation\LidoNationConnector;
use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Connector;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasJsonBody;
use Saloon\Traits\Request\HasConnector;

class GetModelMedia extends Request implements HasBody
{
    use HasConnector, HasJsonBody;

    /**
     * The HTTP method of the request
     */
    protected Method $method = Method::GET;

    public function resolveEndpoint(): string
    {
        return '/model-media';
    }

    public function resolveConnector(): Connector
    {
        return app(LidoNationConnector::class);
    }

    /**
     * Default body
     *
     * @return array<string, mixed>
     */
    protected function defaultBody(): array
    {
        return [
            'app_source' => 'catalystexplorer',
        ];
    }
}
