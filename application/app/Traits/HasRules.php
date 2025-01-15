<?php

declare(strict_types=1);

namespace App\Traits;

use App\Enums\LogicalOperators;
use App\Enums\Operators;
use Illuminate\Database\Eloquent\Builder;

trait HasRules
{
    /**
     * Apply rules to a query builder.
     *
     * @param  Collection  $rules
     */
    public function applyRules(Builder $builder, $rules): Builder
    {
        if ($rules->isEmpty()) {
            return $builder;
        }

        $andRules = $rules->where('logical_operator', LogicalOperators::AND()->value);
        $orRules = $rules->where('logical_operator', LogicalOperators::OR()->value);

        if ($andRules->isNotEmpty()) {
            $builder->where(function ($query) use ($andRules) {
                foreach ($andRules as $rule) {
                    $this->applyRuleToQuery($query, $rule);
                }
            });
        }

        if ($orRules->isNotEmpty()) {
            $builder->orWhere(function ($query) use ($orRules) {
                foreach ($orRules as $rule) {
                    $this->applyRuleToQuery($query, $rule);
                }
            });
        }

        return $builder;
    }

    /**
     * Apply a single rule to a query.
     *
     * @param  object  $rule
     */
    protected function applyRuleToQuery(Builder $query, $rule): void
    {
        if (in_array($rule->operator, [Operators::IS_NULL()->value, Operators::IS_NOT_NULL()->value])) {
            $method = $rule->operator === Operators::IS_NULL()->value ? 'whereNull' : 'whereNotNull';
            $query->{$method}($rule->subject);
        } else {
            $query->where($rule->subject, $rule->operator, $rule->predicate);
        }
    }
}
