<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Connection;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Http\Requests\NovaRequest;

class Connections extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Connection>
     */
    public static $model = Connection::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'id';

    /**
     * The columns that should be searched.
     *
     * @var array<int, string>
     */
    public static $search = [
        'id',
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

            Select::make('Previous Model Type')
                ->options([
                    IdeascaleProfile::class => 'Catalyst User',
                    Group::class => 'Group',
                ])
                ->sortable()
                ->required(),

            BelongsTo::make('Previous Model', 'previous', IdeascaleProfiles::class)
                ->searchable()
                ->nullable(),

            Select::make('Next Model Type')
                ->options([
                    IdeascaleProfile::class => 'Catalyst User',
                    Group::class => 'Group',
                ])
                ->sortable()
                ->required(),

            BelongsTo::make('Next Model', 'next', IdeascaleProfiles::class)
                ->searchable()
                ->nullable(),
        ];
    }
}
