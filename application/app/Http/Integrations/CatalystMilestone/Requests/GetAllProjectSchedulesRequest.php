<?php

declare(strict_types=1);

namespace App\Http\Integrations\CatalystMilestone\Requests;

use Saloon\Enums\Method;
use Saloon\Http\Request;

class GetAllProjectSchedulesRequest extends Request
{
    /**
     * The HTTP method of the request
     */
    protected Method $method = Method::GET;

    public function __construct(protected ?int $offset = null, protected ?int $limit = null) {}

    /**
     * The endpoint for the request
     */
    public function resolveEndpoint(): string
    {
        return '/v1/proposals';
    }

    protected function defaultQuery(): array
    {
        $defaultParams = [
            'order' => 'project_id.asc',
            'select' => 'id, title, url, project_id, created_at, budget, milestones_qty, funds_distributed, starting_date, currency, status',
        ];

        if ((bool) $this->limit) {
            return array_merge($defaultParams, ['limit' => $this->limit, 'offset' => $this->offset]);
        }

        return $defaultParams;
    }
}
