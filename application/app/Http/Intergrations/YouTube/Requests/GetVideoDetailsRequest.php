<?php

declare(strict_types=1);

namespace App\Http\Intergrations\YouTube\Requests;

use App\Http\Intergrations\YouTube\YouTubeConnector;
use Saloon\Enums\Method;
use Saloon\Http\Connector;
use Saloon\Http\Request;
use Saloon\Traits\Request\HasConnector;

class GetVideoDetailsRequest extends Request
{
    use HasConnector;

    protected Method $method = Method::GET;

    public function __construct(
        private string $videoId
    ) {}

    public function resolveConnector(): Connector
    {
        return app(YouTubeConnector::class);
    }

    public function resolveEndpoint(): string
    {
        return '/videos';
    }

    public function defaultQuery(): array
    {
        return [
            'part' => 'contentDetails,snippet,statistics',
            'id' => $this->videoId,
        ];
    }
}
