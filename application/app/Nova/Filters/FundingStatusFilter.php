<?php

declare(strict_types=1);

namespace App\Nova\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Laravel\Nova\Filters\Filter;

class FundingStatusFilter extends Filter
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
    public $name = 'Funding Status';

    /**
     * Apply the filter to the given query.
     *
     * @param  Builder  $query
     * @param  mixed  $value
     * @return Builder
     */
    public function apply(Request $request, $query, $value)
    {
        if (is_array($value) && ! empty($value)) {
            return $query->whereIn('funding_status', $value);
        }

        if (is_string($value) && ! empty($value)) {
            return $query->where('funding_status', $value);
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
            'Funded' => 'funded',
            'Pending' => 'pending',
            'Not Funded' => 'not_funded',
            'Not Approved' => 'not_approved',
            'Over Budget' => 'over_budget',
            'Leftover' => 'leftover',
            'Withdrawn' => 'withdrawn',
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
