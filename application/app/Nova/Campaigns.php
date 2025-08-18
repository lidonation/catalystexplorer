<?php

declare(strict_types=1);

namespace App\Nova;

use App\Enums\CatalystCurrencies;
use App\Enums\FundStatus;
use App\Models\Campaign;
use App\Models\Fund;
use App\Nova\Actions\EditModel;
use App\Nova\Actions\MakeSearchable;
use App\Nova\Actions\UpdateModelMedia;
use Ebess\AdvancedNovaMediaLibrary\Fields\Images;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Color;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Panel;

class Campaigns extends Resource
{
    public static $perPageViaRelationship = 25;

    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Fund>
     */
    public static $model = Campaign::class;

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

            Text::make(__('Label'))
                ->sortable()
                ->required(),

            Text::make(__('Meta Title')),

            Text::make(__('Slug'))->sortable(),

            Select::make(__('Status'), 'status')
                ->options(array_combine(FundStatus::toValues(), FundStatus::toValues()))
                ->default(FundStatus::LAUNCHED()->value)
                ->rules('required')
                ->filterable()
                ->sortable(),

            Select::make(__('Currency'), 'currency')
                ->options(
                    array_combine(CatalystCurrencies::toValues(), CatalystCurrencies::toValues())
                )->filterable()
                ->default(fn () => CatalystCurrencies::ADA()->value)->sortable(),

            DateTime::make('Review Started At')
                ->sortable(),

            DateTime::make('Launched At')
                ->sortable(),

            DateTime::make('Awarded At')
                ->sortable(),

            DateTime::make('Review Started At')
                ->sortable(),

            Number::make('Amount')
                ->required(),

            Color::make(__('Color'))
                ->sortable()
                ->rules('required', 'max:255'),

            BelongsTo::make(__('Fund'), 'fund', Funds::class)
                ->filterable(),

            Textarea::make(__('Excerpt'), 'excerpt')
                ->alwaysShow()
                ->rules('nullable'),

            Textarea::make(__('Comment Prompt'), 'comment_prompt')
                ->alwaysShow()
                ->rules('nullable'),

            Textarea::make(__('Content'), 'content')
                ->rules('nullable'),

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
            (new EditModel),
            (new UpdateModelMedia),
            (new MakeSearchable),
        ];
    }
}
