<?php

declare(strict_types=1);

namespace App\Http\Integrations\OpenAI\Requests;

use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasJsonBody;

class GenerateEmbeddingRequest extends Request implements HasBody
{
    use HasJsonBody;

    protected Method $method = Method::POST;

    public function __construct(
        private string $model,
        private string $input,
        private string $encodingFormat = 'float',
    ) {}

    public function resolveEndpoint(): string
    {
        return '/embeddings';
    }

    protected function defaultBody(): array
    {
        return [
            'model' => $this->model,
            'input' => $this->input,
            'encoding_format' => $this->encodingFormat,
        ];
    }
}
