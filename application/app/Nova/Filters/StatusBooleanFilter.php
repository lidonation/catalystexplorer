<?php

declare(strict_types=1);

namespace App\Nova\Filters;

use Illuminate\Http\Request;
use Laravel\Nova\Filters\BooleanFilter;

class StatusBooleanFilter extends BooleanFilter
{
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
        $selectedStatuses = [];

        foreach ($value as $status => $isSelected) {
            if ($isSelected) {
                $selectedStatuses[] = $status;
            }
        }

        if (! empty($selectedStatuses)) {
            return $query->whereIn('status', $selectedStatuses);
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
}
