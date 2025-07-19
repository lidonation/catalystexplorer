<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MetricCountBy;
use App\Enums\MetricQueryTypes;
use App\Enums\MetricTypes;
use App\Enums\StatusEnum;
use App\Traits\HasRules;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\DB;

class Metric extends Model
{
    use HasRules;

    protected function casts(): array
    {
        return [
            'count_by' => MetricCountBy::class.':nullable',
            'created_at' => 'datetime:Y-m-d',
            'order' => 'integer',
            'query' => MetricQueryTypes::class.':nullable',
            'status' => StatusEnum::class.':nullable',
            'type' => MetricTypes::class.':nullable',
            'updated_at' => 'datetime:Y-m-d',
        ];
    }

    public function metricValue(): Attribute
    {
        return Attribute::make(
            get: function () {
                $modelInstance = new $this->model;
                $table = $modelInstance->getTable();
                $builder = call_user_func([$this->model, 'query']);
                $aggregate = $this->query;
                $field = $this->field;

                if ($this->rules?->isNotEmpty()) {
                    $builder = $this->applyRules($builder, $this->rules, $table);
                }

                return $builder->select(DB::raw("{$aggregate}({$table}.{$field}) as {$aggregate}"))
                    ->value("{$aggregate}");
            }
        );
    }

    public function chartData(): Attribute
    {
        return Attribute::make(
            get: function () {
                // Fetch aggregate series
                $modelInstance = new $this->model;
                $table = $modelInstance->getTable();
                $builder = call_user_func([$this->model, 'query']);
                $aggregate = $this->query;
                $field = $this->field;

                if ($this->rules?->isNotEmpty()) {
                    $builder = $this->applyRules($builder, $this->rules, $table);
                }

                $results = $builder->select('fund_id', DB::raw("{$aggregate}({$table}.{$field}) as {$aggregate}"))
                    ->leftJoin('funds', fn ($join) => $join->on('funds.id', '=', 'proposals.fund_id'))
                    ->with([
                        'fund' => fn ($q) => $q->orderBy('launched_at', 'desc'),
                    ])
                    ->groupBy('fund_id', 'funds.launched_at')
                    ->orderByDesc('funds.launched_at')
                    ->limit(config('app.metric_card.default_limit', 5))
                    ->get()
                    ->map(function ($row) use ($aggregate) {
                        return [
                            'x' => $row->fund?->title,
                            'y' => $row->{$aggregate},
                        ];
                    });

                return [
                    'id' => 'Proposals Count',
                    'color' => $this->color,
                    'data' => $results->reverse()->values(),
                ];
            }
        );
    }

    public function getMultiSeriesChartData()
    {
        if (! $this->rules || $this->rules->count() <= 1) {
            return [$this->chartData];
        }

        $countBy = $this->count_by->value ?? 'fund';
        $seriesData = [];

        foreach ($this->rules as $rule) {
            $modelInstance = new $this->model;
            $table = $modelInstance->getTable();
            $builder = call_user_func([$this->model, 'query']);
            $aggregate = $this->query;
            $field = $this->field;

            // Apply only this specific rule
            $builder = $this->applyRules($builder, collect([$rule]), $table);

            $results = match ($countBy) {
                'year' => $builder->select(
                    DB::raw($this->getDateExtractionSql("{$table}.created_at", 'year').' as year'),
                    DB::raw("{$aggregate}({$table}.{$field}) as {$aggregate}")
                )
                    ->groupBy(DB::raw($this->getDateExtractionSql("{$table}.created_at", 'year')))
                    ->orderByDesc(DB::raw($this->getDateExtractionSql("{$table}.created_at", 'year')))
                    ->get()
                    ->map(fn ($row) => ['x' => (int) $row->year, 'y' => $row->{$aggregate}]),

                'fund', 'funds' => $builder->select(
                    'fund_id',
                    DB::raw("{$aggregate}({$table}.{$field}) as {$aggregate}")
                )
                    ->leftJoin('funds', fn ($join) => $join->on('funds.id', '=', "{$table}.fund_id"))
                    ->with(['fund' => fn ($q) => $q->orderBy('launched_at', 'desc')])
                    ->groupBy('fund_id', 'funds.launched_at')
                    ->orderByDesc('funds.launched_at')
                    ->get()
                    ->map(function ($row) use ($aggregate) {
                        return [
                            'x' => $row->fund?->title ?? "Fund {$row->fund_id}",
                            'y' => $row->{$aggregate},
                        ];
                    }),

                default => $builder->select(
                    $countBy,
                    DB::raw("{$aggregate}({$table}.{$field}) as {$aggregate}")
                )
                    ->groupBy($countBy)
                    ->orderByDesc($aggregate)
                    ->get()
                    ->map(fn ($row) => ['x' => $row->{$countBy}, 'y' => $row->{$aggregate}]),
            };

            $seriesData[] = [
                'id' => $rule->title ?? "Rule {$rule->id}",
                'color' => $rule->color ?? $this->generateSeriesColor($rule->id),
                'data' => $results->values(),
            ];
        }

        return $seriesData;
    }

    /**
     * Generate a color for a series based on rule ID
     */
    private function generateSeriesColor(int $ruleId): string
    {
        $colors = [
            '#8884d8',
            '#82ca9d',
            '#ffc658',
            '#ff7c7c',
            '#8dd1e1',
            '#d084d0',
            '#ffb347',
            '#87d068',
            '#ffa39e',
            '#b7eb8f',
            '#91d5ff',
            '#d3adf7',
        ];

        return $colors[$ruleId % count($colors)];
    }

    /**
     * Enhanced chartData that can handle both single and multi-series
     */
    public function adaptiveChartData(): array
    {
        // Check if we have multiple rules for multi-series
        if ($this->rules && $this->rules->count() > 1) {
            return $this->multiSeriesChartData();
        }

        // Single series - use existing logic
        return [$this->chartData];
    }

    /**
     * Get the appropriate date extraction SQL for PostgreSQL
     */
    private function getDateExtractionSql(string $dateField, string $period): string
    {
        return match ($period) {
            'year' => "EXTRACT(YEAR FROM {$dateField})",
            'month' => "TO_CHAR({$dateField}, 'YYYY-MM')",
            'quarter' => "EXTRACT(YEAR FROM {$dateField}) || '-Q' || EXTRACT(QUARTER FROM {$dateField})",
            'week' => "TO_CHAR({$dateField}, 'YYYY-WW')",
            'day' => "DATE({$dateField})",
            default => "EXTRACT(YEAR FROM {$dateField})",
        };
    }

    public function buildMultiSeriesSearchData(array $userFilters = [], string $searchQuery = ''): array
    {
        if (! $this->rules || $this->rules->count() <= 1) {
            return [$this->dynamicChartData($userFilters)];
        }

        $countBy = $this->count_by->value ?? 'fund';
        $seriesData = [];

        foreach ($this->rules as $rule) {
            // Convert rule to filter format
            $ruleFilter = $this->convertRuleToMeiliFilter($rule);

            // Combine user filters with rule filter
            $combinedFilters = array_merge($userFilters, [$ruleFilter]);

            $args = [
                'filter' => implode(' AND ', array_filter($combinedFilters)),
                'limit' => 0,
                'facets' => $this->getFacetsForCountBy($countBy),
            ];

            // Perform MeiliSearch
            $search = $this->model::search($searchQuery, function ($meili, $query, $options) use ($args) {
                $options['filter'] = $args['filter'];
                $options['limit'] = $args['limit'];
                $options['facets'] = $args['facets'];

                return $meili->search($query, $options);
            })->raw();

            // Process results based on count_by
            $chartData = $this->processMeiliSearchResults($search, $countBy);

            $seriesData[] = [
                'id' => $rule->title ?? "Rule {$rule->id}",
                'color' => $rule->color ?? $this->generateSeriesColor($rule->id),
                'data' => $chartData,
            ];
        }

        return $seriesData;
    }

    /**
     * Convert rule to MeiliSearch filter format
     */
    private function convertRuleToMeiliFilter($rule): string
    {
        $field = $rule->field;
        $operator = $rule->operator;
        $value = $rule->value;

        return match ($operator) {
            'equals', '=' => "{$field} = {$value}",
            'not_equals', '!=' => "{$field} != {$value}",
            'greater_than', '>' => "{$field} > {$value}",
            'less_than', '<' => "{$field} < {$value}",
            'greater_than_or_equal', '>=' => "{$field} >= {$value}",
            'less_than_or_equal', '<=' => "{$field} <= {$value}",
            'in' => "{$field} IN [{$value}]",
            'not_in' => "{$field} NOT IN [{$value}]",
            'is_null' => "{$field} IS NULL",
            'is_not_null' => "{$field} IS NOT NULL",
            'contains' => "{$field} = \"{$value}\"",
            'starts_with' => "{$field} = \"{$value}*\"",
            'ends_with' => "{$field} = \"*{$value}\"",
            default => "{$field} = {$value}",
        };
    }

    /**
     * Get facets array for different count_by options
     */
    private function getFacetsForCountBy(string $countBy): array
    {
        return match ($countBy) {
            'fund', 'funds' => ['fund.title'],
            'year' => ['created_at'], // Use created_at facet like in your controller
            'month' => ['created_at'],
            'quarter' => ['created_at'],
            'status' => ['status'],
            'type' => ['type'],
            default => [$countBy],
        };
    }

    /**
     * Process MeiliSearch results into chart data format
     */
    private function processMeiliSearchResults(array $search, string $countBy): array
    {
        $facetDistribution = $search['facetDistribution'] ?? [];

        return match ($countBy) {
            'fund', 'funds' => $this->processFundFacets($facetDistribution['fund.title'] ?? []),
            'year' => $this->processYearFacets($facetDistribution['created_at_year'] ?? []),
            default => $this->processGenericFacets($facetDistribution[$countBy] ?? []),
        };
    }

    /**
     * Process fund facets with sorting (like in your controller)
     */
    private function processFundFacets(array $funds): array
    {
        // Sort funds like in your controller
        uksort($funds, function ($a, $b) {
            $numA = (int) str_replace('Fund ', '', $a);
            $numB = (int) str_replace('Fund ', '', $b);

            return $numA - $numB;
        });

        return collect($funds)
            ->map(fn ($count, $title) => ['x' => $title, 'y' => $count])
            ->values()
            ->toArray();
    }

    /**
     * Process year facets
     */
    private function processYearFacets(array $years): array
    {
        return collect($years)
            ->map(fn ($count, $year) => ['x' => (int) $year, 'y' => $count])
            ->sortKeysDesc()
            ->values()
            ->toArray();
    }

    public function rules(): MorphMany
    {
        return $this->morphMany(Rule::class, 'model');
    }
}
