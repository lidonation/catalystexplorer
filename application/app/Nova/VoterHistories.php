<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\VoterHistory;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class VoterHistories extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var string
     */
    public static $model = VoterHistory::class;

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
            Text::make('Stake Address', 'stake_address'),
            Text::make('Fragment Id', 'fragment_id'),
            Text::make('Caster', 'caster'),
            Text::make('Time', 'time'),
            Number::make('Proposal', 'weight'),
            Number::make('Choice', 'choice'),
            Number::make('Catalyst Snapshot Id', 'snapshot_id'),
            DateTime::make('Created At', 'created_at')->sortable(),
            DateTime::make('Updated At', 'updated_at')->sortable(),
            DateTime::make('Deleted At', 'deleted_at')->sortable(),
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
