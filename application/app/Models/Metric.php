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
            //            'count_by' => MetricCountBy::class,
            'created_at' => 'datetime:Y-m-d',
            'order' => 'integer',
            //            'query' => MetricQueryTypes::class,
            //            'status' => StatusEnum::class, #Not compatible with nova
            //            'type' => MetricTypes::class,
            'updated_at' => 'datetime:Y-m-d',

        ];
    }

    public function value(): Attribute
    {
        return Attribute::make(
            get: function () {
                $modelInstance = new $this->model;
                $table = $modelInstance->getTable();
                $builder = call_user_func([$this->model, 'query']);
                $aggregate = $this->query;
                $field = $this->field;

                if ($this->rules && $this->rules->isNotEmpty()) {
                    $builder = $this->applyRules($builder, $this->rules);
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
                // fetch aggregate series
                $modelInstance = new $this->model;
                $table = $modelInstance->getTable();
                $builder = call_user_func([$this->model, 'query']);
                $aggregate = $this->query;
                $field = $this->field;

                if (! $modelInstance instanceof Proposal) {
                    return null;
                }

                $results = $builder->select('fund_id', DB::raw("{$aggregate}({$table}.{$field}) as {$aggregate}"))
                    ->leftJoin('funds', fn ($join) => $join->on('funds.id', '=', 'proposals.fund_id'))
                    ->with([
                        'fund' => fn ($q) => $q->orderBy('launched_at', 'asc'),
                    ])
                    ->groupBy('fund_id', 'funds.launched_at')
                    ->orderBy('funds.launched_at', 'asc')
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
                    'data' => $results,
                ];
            }
        );
    }

    public function rules(): MorphMany
    {
        return $this->morphMany(Rule::class, 'model');
    }
}
