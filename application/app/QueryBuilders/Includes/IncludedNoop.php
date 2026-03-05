<?php

declare(strict_types=1);

namespace App\QueryBuilders\Includes;

use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Includes\IncludeInterface;

/**
 * A no-op include that allows a query parameter to be accepted
 * by the query builder without actually eager-loading a relationship.
 */
class IncludedNoop implements IncludeInterface
{
    public function __invoke(Builder $query, string $include): void
    {
        // No-op: Do not modify the query
    }
}
