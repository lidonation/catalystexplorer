<?php

declare(strict_types=1);

namespace App\Nova\Filters;

use App\Enums\ServiceTypeEnum;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Laravel\Nova\Filters\Filter;
use Laravel\Nova\Http\Requests\NovaRequest;

class ServiceTypeFilter extends Filter
{
    /**
     * The filter's component.
     *
     * @var string
     */
    public $component = 'select-filter';

    /**
     * Apply the filter to the given query.
     */
    public function apply(NovaRequest $request, Builder $query, mixed $value): Builder
    {
        return $query->where('type', $value);
    }

    /**
     * Get the filter's available options.
     */
    public function options(NovaRequest $request): array
    {
        return [
            'Offered Services' => ServiceTypeEnum::offered(),
            'Needed Services' => ServiceTypeEnum::needed(),
        ];
    }

    /**
     * Get the displayable name of the filter.
     */
    public function name(): string
    {
        return __('Service Type');
    }
}
