<?php

declare(strict_types=1);

namespace App\Http\Intergrations\YouTube;

use Saloon\Http\Connector;

class YouTubeConnector extends Connector
{
    public function resolveBaseUrl(): string
    {
        return 'https://www.googleapis.com/youtube/v3';
    }

    public function defaultHeaders(): array
    {
        return [
            'Accept' => 'application/json',
        ];
    }

    public function defaultQuery(): array
    {
        return [
            'key' => config('services.youtube.api_key'),
        ];
    }
}
