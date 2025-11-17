<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\ReviewerReputationScore;
use App\Nova\Actions\MakeSearchable;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\MorphTo;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Http\Requests\NovaRequest;

class ReviewerReputationScores extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<ReviewerReputationScore>
     */
    public static $model = ReviewerReputationScore::class;

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

            BelongsTo::make(__('Reviewer'), 'reviewer', Reviewers::class)
                ->searchable()
                ->filterable()
                ->sortable(),

            Number::make(__('Score'), 'score')
                ->sortable()
                ->displayUsing(fn ($value) => $value ? "{$value}%" : 'N/A')
                ->help('Reputation score as a percentage'),

            MorphTo::make(__('Context'), 'context')
                ->types([
                    Funds::class,
                ])
                ->searchable(),

            DateTime::make(__('Created At'), 'created_at')
                ->sortable()
                ->hideFromIndex()
                ->hideWhenCreating()
                ->hideWhenUpdating(),

            DateTime::make(__('Updated At'), 'updated_at')
                ->sortable()
                ->hideFromIndex()
                ->hideWhenCreating()
                ->hideWhenUpdating(),

            DateTime::make(__('Deleted At'), 'deleted_at')
                ->sortable()
                ->hideFromIndex()
                ->hideWhenCreating()
                ->hideWhenUpdating()
                ->nullable(),
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
