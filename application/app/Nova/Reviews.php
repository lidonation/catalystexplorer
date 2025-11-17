<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Review;
use App\Nova\Actions\MakeSearchable;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;

class Reviews extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Review>
     */
    public static $model = Review::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'id';

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id',
    ];

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, Field>
     */
    public function fields(NovaRequest $request): array
    {
        return [
            ID::make()->sortable(),

            Textarea::make('Content'),

            BelongsTo::make(__('Proposal'), 'proposal', Proposals::class)
                ->searchable()
                ->filterable(),

            BelongsTo::make(__('Reviewer'), 'reviewer', Reviewers::class)
                ->searchable()
                ->filterable(),

            HasMany::make('Metadata', 'metas', Metas::class),

        ];
    }

    /**
     * Get the actions available for the resource.
     *
     * @return array<int, Action>
     */
    public function actions(NovaRequest $request): array
    {
        return [
            (new MakeSearchable),
        ];
    }
}
