<?php

declare(strict_types=1);

namespace App\Traits;

use App\Enums\LogicalOperators;
use App\Enums\Operators;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

trait HasRules
{
    /**
     * Apply rules to a query builder.
     */
    public function applyRules(Builder $builder, Collection $rules, string $table): Builder
    {
        if ($rules->isEmpty()) {
            return $builder;
        }

        $andRules = $rules->where('logical_operator', LogicalOperators::AND()->value);
        $orRules = $rules->where('logical_operator', LogicalOperators::OR()->value);

        if ($andRules->isNotEmpty()) {
            $builder->where(function ($query) use ($andRules, $table) {
                foreach ($andRules as $rule) {
                    $this->applyRuleToQuery($query, $rule, $table);
                }
            });
        }

        if ($orRules->isNotEmpty()) {
            $builder->orWhere(function ($query) use ($orRules, $table) {
                foreach ($orRules as $rule) {
                    $this->applyRuleToQuery($query, $rule, $table);
                }
            });
        }

        return $builder;
    }

    /**
     * Apply a single rule to a query.
     */
    protected function applyRuleToQuery(Builder $query, object $rule, string $table): void
    {
        $subject = $this->buildSubject($rule->subject, $table);

        if ($this->isNullOperator($rule->operator)) {
            $this->applyNullQuery($query, $subject, $rule->operator);

            return;
        }

        if ($this->isInOperator($rule->operator)) {
            $this->applyInQuery($query, $subject, $rule->operator, $rule->predicate);

            return;
        }

        $query->where($subject, $rule->operator, $rule->predicate);
    }

    private function buildSubject(string $subject, string $table): string
    {
        return str_contains($subject, '.') ? $subject : "{$table}.{$subject}";
    }

    private function isNullOperator(string $operator): bool
    {
        return in_array($operator, [
            Operators::IS_NULL()->value,
            Operators::IS_NOT_NULL()->value,
        ]);
    }

    private function isInOperator(string $operator): bool
    {
        return in_array($operator, [
            Operators::IN()->value,
            Operators::NOT_IN()->value,
        ]);
    }

    private function applyNullQuery(Builder $query, string $subject, string $operator): void
    {
        $method = $operator === Operators::IS_NULL()->value ? 'whereNull' : 'whereNotNull';
        $query->{$method}($subject);
    }

    private function applyInQuery(Builder $query, string $subject, string $operator, mixed $predicate): void
    {
        $values = $this->prepareInValues($predicate);
        $method = $operator === Operators::IN()->value ? 'whereIn' : 'whereNotIn';
        $query->{$method}($subject, $values);
    }

    private function prepareInValues(mixed $predicate): array
    {
        if (! is_string($predicate)) {
            return (array) $predicate;
        }

        return str_contains($predicate, ',')
            ? array_map('trim', explode(',', $predicate))
            : [$predicate];
    }
}
