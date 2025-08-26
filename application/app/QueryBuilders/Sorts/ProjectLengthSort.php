<?php

declare(strict_types=1);

namespace App\QueryBuilders\Sorts;

use App\Models\Proposal;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\Sorts\Sort;

class ProjectLengthSort implements Sort
{
    public function __invoke(Builder $query, bool $descending, string $property): void
    {
        $metaTable = 'metas';
        $alias = 'meta_project_length';
        $modelClass = Proposal::class;

        $joins = collect($query->getQuery()->joins ?? []);
        $alreadyJoined = $joins->contains(function ($join) use ($metaTable, $alias) {
            return $join->table === "$metaTable as $alias";
        });

        if (! $alreadyJoined) {
            $query->leftJoin("$metaTable as $alias", function ($join) use ($alias, $modelClass) {
                $join->on("$alias.model_id", '=', DB::raw('proposals.id::text'))
                    ->where("$alias.model_type", '=', $modelClass)
                    ->where("$alias.key", '=', 'project_length');
            });
        }

        $query->select('proposals.*');

        $orderExpr = "CASE WHEN $alias.content ~ '^[0-9]+' THEN ($alias.content)::int ELSE NULL END";
        $direction = $descending ? 'DESC' : 'ASC';

        $query->orderByRaw("$orderExpr $direction NULLS LAST");
    }
}

