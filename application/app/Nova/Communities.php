<?php

declare(strict_types=1);

namespace App\Nova;

use App\Enums\StatusEnum;
use App\Models\Community;
use App\Nova\Actions\MakeSearchable;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsToMany;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;

class Communities extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Community>
     */
    public static $model = Community::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'name';

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id',
        'title',
        'content',
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

            Text::make(__('Title'))
                ->required(),

            Text::make(__('Slug'))->sortable(),

            Select::make('Status', 'status')
                ->options(StatusEnum::toArray())
                ->default(StatusEnum::draft()),

            Textarea::make(__('Content'))
                ->required(),

            BelongsToMany::make('Proposals', 'proposals', Proposals::class)
                ->searchable(),

            BelongsToMany::make('Ideascale Profiles', 'ideascale_profiles', IdeascaleProfiles::class)
                ->searchable(),
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
