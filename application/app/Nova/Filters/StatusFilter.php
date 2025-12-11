<?php

declare(strict_types=1);

namespace App\Nova\Filters;

use Illuminate\Http\Request;
use Laravel\Nova\Filters\Filter;

class StatusFilter extends Filter
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
    public $name = 'Status';

    /**
     * Apply the filter to the given query.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  mixed  $value
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function apply(Request $request, $query, $value)
    {
        if (is_array($value) && ! empty($value)) {
            return $query->whereIn('status', $value);
        }

        if (is_string($value) && ! empty($value)) {
            return $query->where('status', $value);
        }

        return $query;
    }

    /**
     * Get the filter's available options.
     *
     * @return array
     */
    public function options(Request $request)
    {
        return [
            'Pending' => 'pending',
            'Active' => 'active',
            'Complete' => 'complete',
            'In Progress' => 'in_progress',
            'Over Budget' => 'over_budget',
            'Not Approved' => 'not_approved',
            'Unfunded' => 'unfunded',
        ];
    }

    /**
     * Determine if the filter should be shown on the index view.
     */
    public function authorizedToSee(Request $request): bool
    {
        return true;
    }
}
