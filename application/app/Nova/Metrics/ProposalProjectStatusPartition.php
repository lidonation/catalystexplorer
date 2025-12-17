<?php

declare(strict_types=1);

namespace App\Nova\Metrics;

use App\Models\Proposal;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Metrics\Partition;

class ProposalProjectStatusPartition extends Partition
{
    /**
     * Calculate the value of the metric.
     */
    public function calculate(NovaRequest $request): mixed
    {
        $query = Proposal::query();

        return $this->count($request, $query, 'status')
            ->label(function ($value) {
                return match ($value) {
                    'pending' => 'Pending',
                    'active' => 'Active',
                    'complete' => 'Complete',
                    'over_budget' => 'Over Budget',
                    'not_approved' => 'Not Approved',
                    'unfunded' => 'Unfunded',
                    'in_progress' => 'In Progress',
                    default => ucfirst(str_replace('_', ' ', $value ?? 'Unknown')),
                };
            })
            ->colors([
                'pending' => '#f59e0b',      // Amber
                'active' => '#3b82f6',       // Blue
                'complete' => '#22c55e',     // Green
                'over_budget' => '#f97316',  // Orange
                'not_approved' => '#ef4444', // Red
                'unfunded' => '#dc2626',     // Dark red
                'in_progress' => '#8b5cf6',  // Purple
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
        return 'proposal-project-status-partition';
    }

    /**
     * Get the displayable name of the metric.
     */
    public function name(): string
    {
        return 'Proposal Project Status';
    }
}
