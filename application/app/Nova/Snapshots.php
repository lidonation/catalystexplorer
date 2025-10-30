<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Snapshot;
use App\Nova\Actions\ImportVotingPower;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class Snapshots extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Snapshot>
     */
    public static $model = Snapshot::class;

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
            Text::make('Snapshot Name'),
            DateTime::make('Snapshot Date', 'snapshot_at'),
            HasMany::make('Voting Powers', 'votingPowers', VotingPowers::class),
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
            (new ImportVotingPower),
        ];
    }
}
