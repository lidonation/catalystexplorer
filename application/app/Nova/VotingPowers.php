<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\VotingPower;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class VotingPowers extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<VotingPower>
     */
    public static $model = VotingPower::class;

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
        'voter_id',
        'delegate',
    ];

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, \Laravel\Nova\Fields\Field>
     */
    public function fields(NovaRequest $request): array
    {
        return [
            ID::make()->sortable(),

            Text::make('Voter ID')
                ->sortable()
                ->filterable()
                ->help('Unique identifier for the voter'),

            Text::make('Delegate')
                ->sortable()
                ->filterable()
                ->nullable()
                ->help('Delegate address if applicable'),

            Number::make('Voting Power')
                ->step(0.00000001)
                ->sortable()
                ->filterable()
                ->help('Amount of voting power for this voter'),

            Boolean::make('Consumed')
                ->sortable()
                ->filterable()
                ->nullable()
                ->help('Whether this voting power has been consumed/used'),

            Number::make('Votes Cast')
                ->sortable()
                ->filterable()
                ->help('Number of votes cast by this voter'),

            Number::make('Old ID')
                ->sortable()
                ->nullable()
                ->hideFromIndex()
                ->help('Legacy ID from previous system'),

            BelongsTo::make('Snapshot', 'snapshot', Snapshots::class)
                ->sortable()
                ->filterable(),

            BelongsTo::make('Voter', 'voter', Voters::class)
                ->sortable()
                ->nullable()
                ->hideFromIndex()
                ->help('Related voter record'),

            DateTime::make('Created At')
                ->sortable()
                ->hideFromIndex()
                ->readonly(),

            DateTime::make('Updated At')
                ->sortable()
                ->hideFromIndex()
                ->readonly(),
        ];
    }

    /**
     * Get the cards available for the resource.
     *
     * @return array<int, \Laravel\Nova\Card>
     */
    public function cards(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the filters available for the resource.
     *
     * @return array<int, \Laravel\Nova\Filters\Filter>
     */
    public function filters(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the lenses available for the resource.
     *
     * @return array<int, \Laravel\Nova\Lenses\Lens>
     */
    public function lenses(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the actions available for the resource.
     *
     * @return array<int, \Laravel\Nova\Actions\Action>
     */
    public function actions(NovaRequest $request): array
    {
        return [];
    }
}
