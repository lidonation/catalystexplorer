<?php

declare(strict_types=1);

namespace App\Nova\Filters;

use Illuminate\Database\Eloquent\Builder;
use Laravel\Nova\Filters\Filter;
use Laravel\Nova\Http\Requests\NovaRequest;

class NMKRNftsFilter extends Filter
{
    /**
     * Apply the filter to the given query.
     *
     * @param  Builder  $query
     * @param  mixed  $value
     */
    public function apply(NovaRequest $request, $query, $value): Builder
    {
        return $query->when(
            $value === 'Synced',
            fn ($query) => $query->whereHas(
                'metas',
                fn ($query) => $query->where('key', 'nmkr_nftuid')
            )
        )->when(
            $value === 'Not Synced',
            fn ($query) => $query->whereDoesntHave(
                'metas',
                fn ($query) => $query->where('key', 'nmkr_nftuid')
            )
        );
    }

    /**
     * Get the filter's available options.
     */
    public function options(NovaRequest $request): array
    {
        return [
            'Synced',
            'Not Synced',
        ];
    }
}
