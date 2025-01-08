<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\DateFormatCast;
use App\Enums\MetricCountBy;
use App\Enums\MetricQueryTypes;
use App\Enums\MetricTypes;
use App\Enums\StatusEnum;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\DB;

class Metric extends Model
{
    protected function casts(): array
    {
        return [
            'count_by' => MetricCountBy::class,
            'created_at' => DateFormatCast::class,
            'order' => 'integer',
            'query' => MetricQueryTypes::class,
            'status' => StatusEnum::class,
            'type' => MetricTypes::class,
            'updated_at' => DateFormatCast::class,

        ];
    }

    public function value(): Attribute
    {
        return Attribute::make(
            get: function () {
                $modelInstance = new $this->model;
                $table = $modelInstance->getTable();
                $builder = call_user_func([$this->model, 'query']);
                $aggregate = $this->query?->value;
                $field = $this->field;

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
                $aggregate = $this->query?->value;
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
                            'x' => $row->fund->title,
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
}
