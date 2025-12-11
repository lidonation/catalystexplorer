<?php

declare(strict_types=1);

namespace App\Http\Integrations\Vimeo;

use Saloon\Http\Connector;

class VimeoConnector extends Connector
{
    public function resolveBaseUrl(): string
    {
        return 'https://api.vimeo.com';
    }

    public function defaultHeaders(): array
    {
        return [
            'Accept' => 'application/json',
            'Authorization' => 'Bearer '.config('services.vimeo.access_token'),
        ];
    }
}
