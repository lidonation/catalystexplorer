<?php

declare(strict_types=1);

namespace App\Http\Integrations\Vimeo\Requests;

use App\Http\Integrations\Vimeo\VimeoConnector;
use Saloon\Enums\Method;
use Saloon\Http\Connector;
use Saloon\Http\Request;
use Saloon\Traits\Request\HasConnector;

class GetVideoDetailsRequest extends Request
{
    use HasConnector;

    protected Method $method = Method::GET;

    public function __construct(
        private readonly string $videoId
    ) {}

    public function resolveConnector(): Connector
    {
        return app(VimeoConnector::class);
    }

    public function resolveEndpoint(): string
    {
        return "/videos/{$this->videoId}";
    }

    public function defaultQuery(): array
    {
        return [
            'fields' => 'duration,name',
        ];
    }
}
