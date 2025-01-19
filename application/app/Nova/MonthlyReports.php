<?php

declare(strict_types=1);

namespace App\Nova;

use App\Enums\MonthlyReportStatus;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Markdown;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class MonthlyReports extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<\App\Models\MonthlyReport>
     */
    public static $model = \App\Models\MonthlyReport::class;

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
        'title',
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
            
            Text::make(__('Title'), 'title')
            ->sortable()
            ->rules('required', 'max:255'),

            Markdown::make(__('Content'), 'content')
                ->alwaysShow()
                ->rules('nullable'),

            Select::make(__('Status'), 'status')
                ->options([
                    MonthlyReportStatus::DRAFT()->value => MonthlyReportStatus::DRAFT()->value,
                    MonthlyReportStatus::PUBLISHED()->value => MonthlyReportStatus::PUBLISHED()->value
                ])
                ->default(MonthlyReportStatus::DRAFT()->value)
                ->rules('required')
                ->sortable(),

            BelongsTo::make(__('Ideascale Profile'), 'ideascale_profile', IdeascaleProfiles::class)
                ->sortable()
                ->searchable()
                ->rules('required'),
        ];
    }

    /**
     * Get the cards available for the resource.
     *
     * @return array<int, \Laravel\Nova\Card>
     */
    public function cards(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the filters available for the resource.
     *
     * @return array<int, \Laravel\Nova\Filters\Filter>
     */
    public function filters(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the lenses available for the resource.
     *
     * @return array<int, \Laravel\Nova\Lenses\Lens>
     */
    public function lenses(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the actions available for the resource.
     *
     * @return array<int, \Laravel\Nova\Actions\Action>
     */
    public function actions(NovaRequest $request): array
    {
        return [];
    }

    
}
