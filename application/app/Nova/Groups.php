<?php

declare(strict_types=1);

namespace App\Nova;

use App\Enums\StatusEnum;
use App\Models\Group;
use App\Nova\Actions\MakeSearchable;
use App\Nova\Actions\UpdateModelMedia;
use Ebess\AdvancedNovaMediaLibrary\Fields\Images;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\BelongsToMany;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Panel;

class Groups extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Group>
     */
    public static $model = Group::class;

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
        'name',
        'email',
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

            Text::make(__('Name'))
                ->sortable()
                ->required(),

            Text::make(__('Slug'))->sortable(),

            Select::make('Status', 'status')
                ->options(StatusEnum::toValues())
                ->default(StatusEnum::draft())
                ->sortable(),

            BelongsTo::make('Owner', 'owner', IdeascaleProfiles::class)->searchable(),

            Textarea::make(__('Bio'))
                ->sortable()
                ->required(),

            new Panel('Media', self::mediaFields()),

            HasMany::make('Proposals', 'proposals', Proposals::class),

            BelongsToMany::make('Ideascale Profiles', 'ideascale_profiles', IdeascaleProfiles::class)
                ->searchable(),

            BelongsToMany::make('Locations', 'locations', Locations::class)
                ->searchable()->fields(function () {
                    return [
                        Text::make(__('Model'), 'model_type')
                            ->default(function (NovaRequest $request) {
                                return $request->model()::class;
                            }),
                    ];
                }),

        ];
    }

    public static function mediaFields(): array
    {
        return [
            Images::make(__('Hero'), 'hero')
                ->enableExistingMedia(),
            Images::make(__('Banner'), 'banner')
                ->enableExistingMedia(),
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
            (new UpdateModelMedia),
            (new MakeSearchable),
        ];
    }
}
