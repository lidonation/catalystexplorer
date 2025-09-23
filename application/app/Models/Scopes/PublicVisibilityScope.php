<?php

declare(strict_types=1);

namespace App\Models\Scopes;

use App\Enums\BookmarkVisibility;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class PublicVisibilityScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $builder->where('visibility', BookmarkVisibility::PUBLIC()->value);
    }
}
