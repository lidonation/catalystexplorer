<?php

declare(strict_types=1);

namespace App\Http\Intergrations\LidoNation\Requests;

use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Http\SoloRequest;
use Saloon\Traits\Body\HasJsonBody;

class GetProposalDetails extends SoloRequest implements HasBody
{
    use HasJsonBody;

    /**
     * The HTTP method of the request
     */
    protected Method $method = Method::GET;

    public function __construct(public string $ideascaleUrl, public int $page) {}

    public function resolveEndpoint(): string
    {
        return config('services.lido.api_base_url').'/proposal-details';
    }

    /**
     * Default body
     *
     * @return array<string, mixed>
     */
    protected function defaultBody(): array
    {
        return [
            'ideascaleUrl' => $this->ideascaleUrl,
            'page' => $this->page,
            'limit' => 25,
        ];
    }
}
