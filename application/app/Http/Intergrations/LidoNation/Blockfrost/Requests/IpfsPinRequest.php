<?php

declare(strict_types=1);

namespace App\Http\Intergrations\LidoNation\Blockfrost\Requests;

use Saloon\Enums\Method;
use Saloon\Http\Connector;
use Saloon\Traits\Request\HasConnector;

class IpfsPinRequest extends BlockfrostRequest
{
    use HasConnector;

    protected Method $method = Method::POST;

    public function __construct(
        protected string $cid
    ) {
        parent::__construct('');
    }

    public function resolveConnector(): Connector
    {
        return app(\App\Http\Intergrations\LidoNation\Blockfrost\IpfsConnector::class);
    }

    public function resolveEndpoint(): string
    {
        return "/ipfs/pin/add/{$this->cid}";
    }

    protected function defaultConfig(): array
    {
        return [
            'timeout' => 120,
        ];
    }
}
