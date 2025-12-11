<?php

declare(strict_types=1);

namespace App\Http\Integrations\LidoNation\Blockfrost\Requests;

use App\Http\Integrations\LidoNation\Blockfrost\BlockfrostConnector;
use Saloon\Enums\Method;
use Saloon\Http\Connector;
use Saloon\Http\Request;
use Saloon\Traits\Request\HasConnector;

class BlockfrostRequest extends Request
{
    use HasConnector;

    protected Method $method = Method::GET;

    public function __construct(
        protected string $endpoint
    ) {}

    public function resolveConnector(): Connector
    {
        return app(BlockfrostConnector::class);
    }

    public function resolveEndpoint(): string
    {
        return $this->endpoint;
    }

    protected function defaultConfig(): array
    {
        return [
            'timeout' => 120,
        ];
    }
}
