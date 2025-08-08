<?php

declare(strict_types=1);

namespace App\Http\Intergrations\LidoNation\Blockfrost;

use Saloon\Contracts\Authenticator;
use Saloon\Http\Auth\HeaderAuthenticator;
use Saloon\Http\Connector;

class IpfsConnector extends Connector
{
    public function resolveBaseUrl(): string
    {
        return config('services.blockfrost.ipfs_gateway', 'https://ipfs.blockfrost.io/api/v0');
    }

    protected function defaultHeaders(): array
    {
        return [
            'Accept' => 'application/json',
        ];
    }

    protected function defaultAuth(): ?Authenticator
    {
        return new HeaderAuthenticator(
            config('services.blockfrost.ipfs_project_id') ?: config('services.blockfrost.project_id'),
            'project_id'
        );
    }
}
