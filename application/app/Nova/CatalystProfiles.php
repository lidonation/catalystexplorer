<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\CatalystProfile;
use App\Nova\Actions\MakeSearchable;
use App\Nova\Filters\ClaimedStatusFilter;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Card;
use Laravel\Nova\Exceptions\HelperNotSupported;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\BelongsToMany;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Filters\Filter;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Lenses\Lens;

class CatalystProfiles extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<CatalystProfiles>
     */
    public static $model = CatalystProfile::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'username';

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id',
        'username',
        'name',
        'catalyst_id',
    ];

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, Field>
     *
     * @throws HelperNotSupported
     */
    public function fields(NovaRequest $request): array
    {
        return [
            Text::make('ID', 'id')
                ->sortable()
                ->readonly()
                ->copyable()
                ->displayUsing(function ($value) {
                    return substr($value, 0, 8).'...';
                })
                ->help('UUID identifier for this Catalyst Profile'),

            Text::make('Username')
                ->sortable()
                ->rules('required', 'max:255')
                ->withMeta([
                    'extraAttributes' => [
                        'autocomplete' => 'off',
                    ],
                ]),

            Text::make('Name')
                ->sortable()
                ->nullable()
                ->rules('max:255')
                ->withMeta([
                    'extraAttributes' => [
                        'autocomplete' => 'off',
                    ],
                ]),

            Text::make('Catalyst ID')
                ->sortable()
                ->nullable()
                ->withMeta([
                    'extraAttributes' => [
                        'autocomplete' => 'off',
                    ],
                ]),

            Text::make('Old ID')
                ->sortable()
                ->nullable()
                ->hideFromIndex()
                ->readonly(),

            BelongsTo::make(__('Claimed By'), 'claimedBy', Users::class)
                ->nullable()
                ->searchable(),

            BelongsToMany::make(__('Proposals'), 'proposals', Proposals::class)
                ->searchable(),

            DateTime::make('Created At')
                ->sortable()
                ->readonly()
                ->hideFromIndex(),

            DateTime::make('Updated At')
                ->sortable()
                ->readonly()
                ->hideFromIndex(),
        ];
    }

    /**
     * Get the cards available for the resource.
     *
     * @return array<int, Card>
     */
    public function cards(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the filters available for the resource.
     *
     * @return array<int, Filter>
     */
    public function filters(NovaRequest $request): array
    {
        return [
            ClaimedStatusFilter::make(),
        ];
    }

    /**
     * Get the lenses available for the resource.
     *
     * @return array<int, Lens>
     */
    public function lenses(NovaRequest $request): array
    {
        return [];
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
