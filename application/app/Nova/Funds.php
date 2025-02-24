<?php

declare(strict_types=1);

namespace App\Nova;

use App\Enums\CatalystCurrencies;
use App\Models\Fund;
use Ebess\AdvancedNovaMediaLibrary\Fields\Images;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Slug;
use Laravel\Nova\Fields\Stack;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Panel;

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

            new Panel('Media', self::mediaFields()),

            HasMany::make('Metadata', 'metas', Metas::class),

            HasMany::make('Proposals', 'proposals', Proposals::class),
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
}
