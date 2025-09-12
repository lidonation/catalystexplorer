<?php

declare(strict_types=1);

namespace App\Nova\Filters;

use Illuminate\Contracts\Database\Eloquent\Builder;
use Laravel\Nova\Filters\Filter;
use Laravel\Nova\Http\Requests\NovaRequest;

class ClaimedStatusFilter extends Filter
{
    /**
     * The filter's component.
     *
     * @var string
     */
    public $component = 'select-filter';

    /**
     * The displayable name of the filter.
     *
     * @var string
     */
    public $name = 'Claimed Status';

    /**
     * Apply the filter to the given query.
     */
    public function apply(NovaRequest $request, Builder $query, mixed $value): Builder
    {
        switch ($value) {
            case 'claimed':
                return $query->whereNotNull('claimed_by');
            case 'unclaimed':
                return $query->whereNull('claimed_by');
            default:
                return $query;
        }
    }

    /**
     * Get the filter's available options.
     *
     * @return array<string, string>
     */
    public function options(NovaRequest $request): array
    {
        return [
            'All' => null,
            'Claimed' => 'claimed',
            'Unclaimed' => 'unclaimed',
        ];
    }
}
