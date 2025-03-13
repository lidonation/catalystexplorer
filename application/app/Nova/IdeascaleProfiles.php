<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\IdeascaleProfile;
use App\Nova\Actions\MakeSearchable;
use App\Nova\Actions\UpdateModelMedia;
use Ebess\AdvancedNovaMediaLibrary\Fields\Images;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class IdeascaleProfiles extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<IdeascaleProfile>
     */
    public static $model = IdeascaleProfile::class;

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

            Images::make(__('Profile Pic'), 'profile')
                ->showOnIndex()
                ->enableExistingMedia(),

            Text::make('Name')
                ->sortable()->withMeta(
                    [
                        'extraAttributes' => [
                            'autocomplete' => 'off',
                        ],
                    ]
                )
                ->rules('max:255')
                ->required(),

            Text::make('username')
                ->sortable()->withMeta(
                    [
                        'extraAttributes' => [
                            'autocomplete' => 'off',
                        ],
                    ]
                ),

            Text::make('ideascale Id')
                ->sortable()->withMeta(
                    [
                        'extraAttributes' => [
                            'autocomplete' => 'off',
                        ],
                    ]
                ),

            Text::make('Email')
                ->sortable()->nullable()->withMeta(
                    [
                        'extraAttributes' => [
                            'autocomplete' => 'off',
                        ],
                    ]
                )
                ->required(),

            BelongsTo::make(__('Claimed By'), 'claimed_by', Users::class)
                ->nullable()
                ->searchable(),

            HasMany::make('Metadata', 'metas', Metas::class),
        ];
    }

    /**
     * Get the actions available for the resource.
     *
     * @return array<int, \Laravel\Nova\Actions\Action>
     */
    public function actions(NovaRequest $request): array
    {
        return [
            (new UpdateModelMedia),
            (new MakeSearchable),
        ];
    }
}
