<?php

declare(strict_types=1);

namespace App\Nova\Metrics;

use App\Enums\ProposalStatus;
use App\Models\Proposal;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Metrics\Progress;

class ProposalCompletionProgress extends Progress
{
    /**
     * Calculate the value of the metric.
     */
    public function calculate(NovaRequest $request): mixed
    {
        $query = Proposal::query();
        $query = $this->applyResourceFilters($request, $query);

        $completed = (clone $query)->where('status', ProposalStatus::complete()->value)->count();
        $funded = (clone $query)->whereNotNull('funded_at')->count();

        // Avoid division by zero when there are no funded proposals
        if ($funded === 0) {
            return $this->result(0, 1)->suffix('/ 0');
        }

        return $this->result($completed, $funded)->suffix("/ {$funded}");
    }

    /**
     * Apply all resource filters (both custom and relationship-based).
     */
    protected function applyResourceFilters(NovaRequest $request, $query)
    {
        if ($request->has('filter')) {
            $decodedFilters = json_decode(base64_decode($request->filter), false);
            $filters = collect($decodedFilters);

            foreach ($filters as $filter) {
                foreach ($filter as $filterClass => $value) {
                    // Skip if value is empty
                    if (empty($value) && $value !== false && $value !== 0 && $value !== '0') {
                        continue;
                    }

                    if (is_object($value)) {
                        $hasSelection = collect((array) $value)->contains(true);
                        if (! $hasSelection) {
                            continue;
                        }
                    }

                    // Validate that $filterClass is actually a class name (not a field like "DateTime:funded_at")
                    if (! class_exists($filterClass)) {
                        continue;
                    }

                    try {
                        $filterInstance = new $filterClass;
                        $query = $filterInstance->apply($request, $query, $value);
                    } catch (\Throwable $e) {
                        // Skip this filter if it fails to apply
                        \Log::warning('Failed to apply filter in ProposalCompletionProgress', [
                            'filter' => $filterClass,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
            }
        }

        return $query;
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
        return 'proposal-completion-progress';
    }

    /**
     * Get the displayable name of the metric.
     */
    public function name(): string
    {
        return 'Completion Progress';
    }
}
