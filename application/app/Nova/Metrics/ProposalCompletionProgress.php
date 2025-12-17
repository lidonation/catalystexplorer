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
                    if (empty($value) && $value !== false && $value !== 0 && $value !== '0') {
                        continue;
                    }

                    if (is_object($value)) {
                        $hasSelection = collect((array) $value)->contains(true);
                        if (! $hasSelection) {
                            continue;
                        }
                    }

                    $filterInstance = new $filterClass;
                    $query = $filterInstance->apply($request, $query, $value);
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
