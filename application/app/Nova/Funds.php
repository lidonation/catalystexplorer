<?php

namespace App\Nova;

use App\Enums\CatalystCurrencies;
use App\Enums\CatalystGlobals;
use App\Models\Fund;
use Illuminate\Http\Request;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Card;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Slug;
use Laravel\Nova\Fields\Stack;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Filters\Filter;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Lenses\Lens;

class Funds extends Resource
{
    public static $perPageViaRelationship = 25;

    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Fund>
     */
    public static $model = Fund::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'title';

    public static $perPageOptions = [25, 50, 100, 250];

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
                ->sortable()
                ->required(),
            Text::make(__('Slug'))->sortable(),
            Stack::make('Details', [
                Text::make(__('Title'), 'title'),
                Slug::make(__('Summary'), 'summary'),
            ])->readonly(),
            Select::make(__('Currency'), 'currency')->options([
                CatalystCurrencies::USD()->value => CatalystCurrencies::USD()->value,
                CatalystCurrencies::ADA()->value => CatalystCurrencies::ADA()->value,
            ])->default(fn () => CatalystCurrencies::ADA()->value)->sortable(),

            DateTime::make('Launched At')
                ->sortable(),

            Number::make('Amount')
                ->required(),

            HasMany::make('Proposals', 'proposals', Proposals::class),
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
        return [];
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
        return [];
    }
}
