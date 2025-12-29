<?php

declare(strict_types=1);

namespace App\Http\Integrations\CatalystMilestone\Requests;

use Saloon\Enums\Method;
use Saloon\Http\Request;

class GetMilestoneDetailsRequest extends Request
{
    protected array $defaultParams = [
        'select' => '*,signoffs(*),som_reviews(*,users(*)),poas(*,poas_reviews(*,users(*)),signoffs(*))',
        'som_reviews.order' => 'created_at.desc',
        'poas.order' => 'created_at.desc',
        'order' => 'current.desc, created_at.desc',
    ];

    /**
     * The HTTP method of the request
     */
    protected Method $method = Method::GET;

    public function __construct(protected int $proposal_id, protected int $milestone) {}

    /**
     * The endpoint for the request
     */
    public function resolveEndpoint(): string
    {
        return '/v1/soms';
    }

    protected function defaultQuery(): array
    {
        return array_merge($this->defaultParams, [
            'proposal_id' => 'eq.'.$this->proposal_id,
            'milestone' => 'eq.'.$this->milestone,
        ]);
    }
}
