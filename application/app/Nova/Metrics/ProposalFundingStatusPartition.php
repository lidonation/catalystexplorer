<?php

declare(strict_types=1);

namespace App\Nova\Metrics;

use App\Models\Proposal;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Metrics\Partition;

class ProposalFundingStatusPartition extends Partition
{
    /**
     * Calculate the value of the metric.
     */
    public function calculate(NovaRequest $request): mixed
    {
        $query = Proposal::query();

        return $this->count($request, $query, 'funding_status')
            ->label(function ($value) {
                return match ($value) {
                    'funded' => 'Funded',
                    'pending' => 'Pending',
                    'not_funded' => 'Not Funded',
                    'not_approved' => 'Not Approved',
                    'over_budget' => 'Over Budget',
                    'leftover' => 'Leftover',
                    'withdrawn' => 'Withdrawn',
                    default => ucfirst(str_replace('_', ' ', $value ?? 'Unknown')),
                };
            })
            ->colors([
                'funded' => '#22c55e',      // Green
                'pending' => '#f59e0b',     // Amber
                'not_funded' => '#ef4444',  // Red
                'not_approved' => '#dc2626', // Dark red
                'over_budget' => '#f97316',  // Orange
                'leftover' => '#6b7280',     // Gray
                'withdrawn' => '#374151',    // Dark gray
            ]);
    }

    /**
     * Determine the amount of time the results of the metric should be cached.
     */
    public function cacheFor(): \DateTimeInterface|\DateInterval|float|int|null
    {
        return app()->isProduction() ? now()->addMinutes(30) : null;
    }

    /**
     * Get the URI key for the metric.
     */
    public function uriKey(): string
    {
        return 'proposal-funding-status-partition';
    }

    /**
     * Get the displayable name of the metric.
     */
    public function name(): string
    {
        return 'Proposal Funding Status';
    }
}
