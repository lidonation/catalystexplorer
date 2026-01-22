<?php

declare(strict_types=1);

namespace App\Http\Integrations\CatalystReviews\Requests;

use Saloon\Enums\Method;
use Saloon\Http\Request;

class GetProposalScoresRequest extends Request
{
    protected Method $method = Method::GET;

    public function __construct(protected int $reviewModuleId) {}

    public function resolveEndpoint(): string
    {
        return "/proposals/{$this->reviewModuleId}/";
    }
}
