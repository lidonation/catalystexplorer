<?php

declare(strict_types=1);

namespace App\Nova\Filters;

use App\Models\Fund;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Laravel\Nova\Filters\Filter;
use Laravel\Nova\Http\Requests\NovaRequest;

class FundFilter extends Filter
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
    public $name = 'Fund';

    /**
     * Apply the filter to the given query.
     */
    public function apply(NovaRequest $request, Builder $query, mixed $value): Builder
    {
        if ($value === 'all') {
            return $query;
        }

        return $query->where('fund_id', $value);
    }

    /**
     * Get the filter's available options.
     *
     * @return array<string, string|null>
     */
    public function options(NovaRequest $request): array
    {
        // Build options array with title as display and ID as value
        $options = ['All Funds' => 'all'];

        $funds = Fund::orderByDesc('launched_at')->get();

        foreach ($funds as $fund) {
            $options[$fund->title] = $fund->id;
        }

        return $options;
    }
}
