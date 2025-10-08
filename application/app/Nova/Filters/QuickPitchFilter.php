<?php

declare(strict_types=1);

namespace App\Nova\Filters;

use Illuminate\Contracts\Database\Eloquent\Builder;
use Laravel\Nova\Filters\Filter;
use Laravel\Nova\Http\Requests\NovaRequest;

class QuickPitchFilter extends Filter
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
    public $name = 'Quick Pitch Status';

    /**
     * Apply the filter to the given query.
     */
    public function apply(NovaRequest $request, Builder $query, mixed $value): Builder
    {
        return match ($value) {
            'has_quickpitch' => $query->whereNotNull('quickpitch')
                ->where('quickpitch', '!=', ''),
            'no_quickpitch' => $query->where(function ($query) {
                $query->whereNull('quickpitch')
                    ->orWhere('quickpitch', '=', '');
            }),
            default => $query,
        };
    }

    /**
     * Get the filter's available options.
     *
     * @return array<string, string|null>
     */
    public function options(NovaRequest $request): array
    {
        return [
            'All Proposals' => null,
            'Has Quick Pitch' => 'has_quickpitch',
            'No Quick Pitch' => 'no_quickpitch',
        ];
    }
}
