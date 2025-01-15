<?php

declare(strict_types=1);

namespace App\Nova;

use App\Enums\MetricCountBy;
use App\Enums\MetricQueryTypes;
use App\Enums\MetricTypes;
use App\Enums\StatusEnum;
use App\Models\Metric;
use App\Models\Proposal;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Card;
use Laravel\Nova\Fields\Color;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Markdown;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Filters\Filter;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Lenses\Lens;

class Metrics extends Resource
{
    public static $perPageViaRelationship = 25;

    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Metric>
     */
    public static $model = Metric::class;

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

            Text::make(__('Field')),

            Color::make(__('Color')),

            Text::make(__('Context'))
                ->nullable(),

            Select::make(__('Query'), 'query')
                ->options([
                    MetricQueryTypes::SUM()->value => 'Sum',
                    MetricQueryTypes::COUNT()->value => 'Count',
                    MetricQueryTypes::AVG()->value => 'Average',
                    MetricQueryTypes::MAX()->value => 'Max',
                    MetricQueryTypes::MIN()->value => 'Min',
                ])
                ->required(),

            Select::make(__('Count By'), 'count_by')
                ->options([
                    MetricCountBy::FUND()->value => 'Fund',
                    MetricCountBy::YEAR()->value => 'Year',
                    MetricCountBy::MONTH()->value => 'Month',
                    MetricCountBy::WEEK()->value => 'Week',
                    MetricCountBy::DAY()->value => 'Day',
                    MetricCountBy::HOUR()->value => 'Hour',
                    MetricCountBy::MINUTE()->value => 'Minute',
                ])
                ->default(MetricCountBy::FUND()->value)
                ->required(),

            Select::make(__('Type'))
                ->options(
                    [
                        MetricTypes::VALUE()->value => 'Value',
                        MetricTypes::TREND()->value => 'Trend',
                        MetricTypes::PARTITION()->value => 'Partition',
                        MetricTypes::PROGRESS()->value => 'Progress',
                        MetricTypes::TABLE()->value => 'Table',
                    ]
                )
                ->required(),

            Select::make(__('Status'), 'status')
                ->options([
                    StatusEnum::draft()->value => 'Draft',
                    StatusEnum::pending()->value => 'Pending',
                    StatusEnum::published()->value => 'Published',
                ])
                ->required()
                ->default(StatusEnum::draft()->value),

            Select::make(__('Model'))
                ->options([
                    Proposal::class => 'Proposal',
                ])
                ->default(Proposal::class)
                ->required(),

            Number::make(__('Order'))
                ->required(),

            DateTime::make(__('Created At'), 'created_at')
                ->hideWhenCreating()
                ->hideWhenUpdating()
                ->sortable(),

            Markdown::make(__('Content'))
                ->required(),
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
