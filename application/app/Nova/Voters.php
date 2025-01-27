<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Voter;
use App\Models\VoterHistory;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class Voters extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var string
     */
    public static $model = Voter::class;

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
        'stake_pub',
        'stake_key',
        'voting_pub',
        'voting_key',
        'cat_id',
    ];

    /**
     * Get the fields displayed by the resource.
     *
     * @return array
     */
    public function fields(NovaRequest $request)
    {
        return [
            ID::make()->sortable(),
            Text::make('Stake Pub', 'stake_pub'),
            Text::make('Stake Key', 'stake_key'),
            Text::make('Voting Pub', 'voting_pub'),
            Text::make('Voting Key', 'voting_key'),
            Number::make('', 'weight'),
            Text::make('Cat Id', 'cat_id'),
            DateTime::make('Created At', 'created_at')->sortable(),
            DateTime::make('Updated At', 'updated_at')->sortable(),
            DateTime::make('Deleted At', 'deleted_at')->sortable(),

            HasMany::make(__('Registration'), 'registrations', Registrations::class),
        ];
    }

    /**
     * Get the cards available for the request.
     *
     * @return array
     */
    public function cards(NovaRequest $request)
    {
        return [];
    }

    /**
     * Get the filters available for the resource.
     *
     * @return array
     */
    public function filters(NovaRequest $request)
    {
        return [];
    }

    /**
     * Get the lenses available for the resource.
     *
     * @return array
     */
    public function lenses(NovaRequest $request)
    {
        return [];
    }

    /**
     * Get the actions available for the resource.
     */
    public function actions(NovaRequest $request): array
    {
        return [];
    }
}
