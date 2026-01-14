<?php

declare(strict_types=1);

namespace App\Http\Integrations\CatalystReviews\Requests;

use Saloon\Enums\Method;
use Saloon\Http\Request;

class GetFilteredProposalReviewsRequest extends Request
{
    /**
     * The HTTP method of the request
     */
    protected Method $method = Method::GET;

    public function __construct(
        protected int $page = 0,
        protected int $size = 50
    ) {}

    /**
     * The endpoint for the request
     */
    public function resolveEndpoint(): string
    {
        return '/proposal-reviews/filtered/';
    }

    protected function defaultQuery(): array
    {
        return [
            'page' => $this->page,
            'size' => $this->size,
        ];
    }
}
