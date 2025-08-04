<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\MetricCountBy;
use App\Enums\MetricQueryTypes;
use App\Enums\MetricTypes;
use App\Enums\StatusEnum;
use App\Repositories\ProposalRepository;
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

    public function multiSeriesSearchData(array $userFilters, string $searchQuery, string $type)
    {

        if (! $this->rules || $this->rules->count() < 1) {
            return [[
                'id' => $this->name ?? 'Metric Data',
                'color' => $this->color ?? '#8884d8',
                'data' => [],
            ]];
        }

        $countBy = $this->count_by->value ?? 'fund';
        $proposals = app(ProposalRepository::class);
        $baseFilter = is_string($userFilters) ? $userFilters : implode(' AND ', array_filter($userFilters));

        $facetKey = match ($countBy) {
            'fund', 'funds' => 'fund.title',
            'year' => 'created_at',
            default => $countBy,
        };

        $searchOptions = [
            'limit' => 0,
            'facets' => [$facetKey],
        ];

        if (! empty($baseFilter)) {
            $searchOptions['filter'] = $baseFilter;
        }

        try {
            $builder = $proposals->search($searchQuery, $searchOptions);
            $response = new \Illuminate\Support\Fluent($builder->raw());
            $facetData = $response->facetDistribution[$facetKey] ?? [];

            if ($countBy === 'year') {
                $yearCounts = [];
                foreach ($facetData as $date => $count) {
                    $year = date('Y', strtotime($date));
                    $yearCounts[$year] = ($yearCounts[$year] ?? 0) + $count;
                }
                ksort($yearCounts);
                $facetData = $yearCounts;
            }

            if (empty($facetData)) {
                return [];
            }

            $seriesData = [];
            foreach ($this->rules as $rule) {
                try {
                    if ($type === 'distribution') {
                        $ruleChartData = $this->getDistributionData($proposals, $searchQuery, $baseFilter, $facetData, $rule, $countBy, $facetKey);
                    } else {
                        $ruleChartData = $this->getRegularChartData($proposals, $searchQuery, $baseFilter, $facetData, $rule, $countBy, $facetKey);
                    }

                    $seriesData[] = [
                        'id' => $rule->title ?? "Rule {$rule->id}",
                        'data' => array_values($ruleChartData),
                        'count_by' => $countBy,
                        'type' => $type,
                    ];
                } catch (\Exception $e) {

                    $seriesData[] = [
                        'id' => $rule->title ?? "Rule {$rule->id}",
                        'data' => [],
                        'count_by' => $countBy,
                        'type' => $type,
                    ];
                }
            }

            return $seriesData;
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getDistributionData($proposals, $searchQuery, $baseFilter, $facetData, $rule, $countBy, $facetKey)
    {
        $filters = [];

        if (! empty($baseFilter)) {
            $filters[] = "({$baseFilter})";
        }

        if ($rule->subject && $rule->operator && isset($rule->predicate)) {
            $predicate = $rule->predicate;

            if ((str_starts_with($predicate, '[') && str_ends_with($predicate, ']'))) {

                $filterString = substr($predicate, 1, -1);

                $filterArray = array_map('trim', explode(',', $filterString));

                $predicate = $filterArray;
            }

            $ruleFilter = match ($rule->operator) {
                '=', 'equals' => is_array($predicate)
                    ? "{$rule->subject} IN [".collect($predicate)->map(fn ($val) => '"'.addslashes($val).'"')->join(', ').']'
                    : "{$rule->subject} = \"".addslashes($predicate).'"',

                '!=', 'not_equals' => is_array($predicate)
                    ? "{$rule->subject} NOT IN [".collect($predicate)->map(fn ($val) => '"'.addslashes($val).'"')->join(', ').']'
                    : "{$rule->subject} != \"".addslashes($predicate).'"',

                '>', 'greater_than' => "{$rule->subject} > \"".addslashes($predicate).'"',
                '<', 'less_than' => "{$rule->subject} < \"".addslashes($predicate).'"',
                '>=', 'greater_than_or_equal' => "{$rule->subject} >= \"".addslashes($predicate).'"',
                '<=', 'less_than_or_equal' => "{$rule->subject} <= \"".addslashes($predicate).'"',
                'IS NULL' => "{$rule->subject} IS NULL",
                'IS NOT NULL' => "{$rule->subject} IS NOT NULL",

                default => "{$rule->subject} = \"".addslashes($predicate).'"',
            };

            $filters[] = "({$ruleFilter})";
        }

        $combinedFilter = implode(' AND ', $filters);

        try {
            $searchOptions = [
                'limit' => 0,
                'facets' => [$facetKey, 'tags.title'],
            ];

            if (! empty($combinedFilter)) {
                $searchOptions['filter'] = $combinedFilter;
            }

            $builder = $proposals->search($searchQuery, $searchOptions);
            $response = new \Illuminate\Support\Fluent($builder->raw());

            $facetCounts = $response->facetDistribution[$facetKey] ?? [];

            if ($countBy === 'year') {
                $yearCounts = [];
                foreach ($facetCounts as $date => $cnt) {
                    $year = date('Y', strtotime($date));
                    $yearCounts[$year] = ($yearCounts[$year] ?? 0) + $cnt;
                }
                $facetCounts = $yearCounts;
            }

            $tagCounts = $response->facetDistribution['tags.title'] ?? [];

            $ruleChartData = [];
            foreach (array_keys($facetData) as $facetValue) {
                $count = $facetCounts[$facetValue] ?? 0;

                $tags = [];
                foreach ($tagCounts as $tagTitle => $tagCount) {
                    $tags[] = [
                        'title' => $tagTitle,
                        'tagCount' => $tagCount,
                    ];
                }

                $ruleChartData[] = [
                    'count_by' => $facetValue,
                    'count' => $count,
                    'tags' => $tags,
                ];
            }

            return $ruleChartData;
        } catch (\Exception $e) {
            $ruleChartData = [];
            foreach (array_keys($facetData) as $facetValue) {
                $ruleChartData[] = [
                    'count_by' => $facetValue,
                    'count' => 0,
                    'tags' => [],
                ];
            }

            return $ruleChartData;
        }
    }

    private function getRegularChartData($proposals, $searchQuery, $baseFilter, $facetData, $rule, $countBy, $facetKey)
    {
        $ruleFilterPart = '';
        if ($rule->subject && $rule->operator && isset($rule->predicate)) {
            $predicate = $rule->predicate;

            if ((str_starts_with($predicate, '[') && str_ends_with($predicate, ']'))) {

                $filterString = substr($predicate, 1, -1);

                $filterArray = array_map('trim', explode(',', $filterString));

                $predicate = $filterArray;
            }

            $ruleFilterPart = match ($rule->operator) {
                '=', 'equals' => is_array($predicate)
                    ? "{$rule->subject} IN [".collect($predicate)->map(fn ($val) => '"'.addslashes($val).'"')->join(', ').']'
                    : "{$rule->subject} = \"".addslashes($predicate).'"',

                '!=', 'not_equals' => is_array($predicate)
                    ? "{$rule->subject} NOT IN [".collect($predicate)->map(fn ($val) => '"'.addslashes($val).'"')->join(', ').']'
                    : "{$rule->subject} != \"".addslashes($predicate).'"',

                '>', 'greater_than' => "{$rule->subject} > \"".addslashes($predicate).'"',
                '<', 'less_than' => "{$rule->subject} < \"".addslashes($predicate).'"',
                '>=', 'greater_than_or_equal' => "{$rule->subject} >= \"".addslashes($predicate).'"',
                '<=', 'less_than_or_equal' => "{$rule->subject} <= \"".addslashes($predicate).'"',

                'IS NULL' => "{$rule->subject} IS NULL",
                'IS NOT NULL' => "{$rule->subject} IS NOT NULL",

                default => is_array($predicate)
                    ? "{$rule->subject} IN (".collect($predicate)->map(fn ($val) => '"'.addslashes($val).'"')->join(', ').')'
                    : "{$rule->subject} = \"".addslashes($predicate).'"',
            };
        }

        $baseFilterParts = [];
        if (! empty($baseFilter)) {
            $baseFilterParts[] = "({$baseFilter})";
        }
        if (! empty($ruleFilterPart)) {
            $baseFilterParts[] = "({$ruleFilterPart})";
        }

        $combinedBaseFilter = implode(' AND ', $baseFilterParts);

        try {
            $searchOptions = [
                'limit' => 0,
                'facets' => [$facetKey],
            ];

            if (! empty($combinedBaseFilter)) {
                $searchOptions['filter'] = $combinedBaseFilter;
            }

            $builder = $proposals->search($searchQuery, $searchOptions);
            $response = new \Illuminate\Support\Fluent($builder->raw());
            $facetCounts = $response->facetDistribution[$facetKey] ?? [];

            if ($countBy === 'year') {
                $yearCounts = [];
                foreach ($facetCounts as $date => $cnt) {
                    $year = date('Y', strtotime($date));
                    $yearCounts[$year] = ($yearCounts[$year] ?? 0) + $cnt;
                }
                $facetCounts = $yearCounts;
            }

            $ruleChartData = [];
            foreach (array_keys($facetData) as $facetValue) {
                $count = $facetCounts[$facetValue] ?? 0;
                $ruleChartData[] = [
                    'x' => $facetValue,
                    'y' => $count,
                ];
            }

            usort($ruleChartData, function ($a, $b) use ($countBy) {
                if ($countBy === 'year') {
                    return (int) $a['x'] <=> (int) $b['x'];
                }
                preg_match('/\d+/', $a['x'], $aMatches);
                preg_match('/\d+/', $b['x'], $bMatches);

                return ((int) ($aMatches[0] ?? 0)) <=> ((int) ($bMatches[0] ?? 0));
            });

            return $ruleChartData;
        } catch (\Exception $e) {
            $ruleChartData = [];
            foreach (array_keys($facetData) as $facetValue) {
                $ruleChartData[] = [
                    'x' => $facetValue,
                    'y' => 0,
                ];
            }

            return $ruleChartData;
        }
    }

    private function extractFacetValue($proposal, $countBy)
    {
        return match ($countBy) {
            'fund', 'funds' => $proposal['fund']['title'] ?? null,
            'year' => isset($proposal['created_at']) ? date('Y', strtotime($proposal['created_at'])) : null,
            default => $proposal[$countBy] ?? null,
        };
    }

    private function buildYearTimestampFilter(int $year): string
    {
        $startTimestamp = mktime(0, 0, 0, 1, 1, $year);
        $endTimestamp = mktime(0, 0, 0, 1, 1, $year + 1);

        return "created_at_timestamp >= {$startTimestamp} AND created_at_timestamp < {$endTimestamp}";
    }

    public function rules(): MorphMany
    {
        return $this->morphMany(Rule::class, 'model');
    }
}
