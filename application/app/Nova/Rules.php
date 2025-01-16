<?php

declare(strict_types=1);

namespace App\Nova;

use App\Enums\LogicalOperators;
use App\Enums\Operators;
use App\Models\Rule;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\MorphTo;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class Rules extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Rule>
     */
    public static $model = Rule::class;

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
        'Operator',
        'logical_operator',
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

            Text::make(__('Subject'), 'subject')
                ->sortable()
                ->rules('required', 'max:255')
                ->help('Column to consider for the rule prefixed by table(optional) eg currency OR proposals.currency (in snake_case format).'),

            Select::make(__('Operator'), 'operator')
                ->options([
                    Operators::EQUALS_TO()->value => Operators::EQUALS_TO()->value,
                    Operators::NOT_EQUALS_TO()->value => Operators::NOT_EQUALS_TO()->value,
                    Operators::GREATER_THAN()->value => Operators::GREATER_THAN()->value,
                    Operators::LESS_THAN()->value => Operators::LESS_THAN()->value,
                    Operators::GREATER_THAN_OR_EQUALS_TO()->value => Operators::GREATER_THAN_OR_EQUALS_TO()->value,
                    Operators::LESS_THAN_OR_EQUALS_TO()->value => Operators::LESS_THAN_OR_EQUALS_TO()->value,
                    Operators::IS_NULL()->value => Operators::IS_NULL()->value,
                    Operators::IS_NOT_NULL()->value => Operators::IS_NOT_NULL()->value,
                    Operators::IN()->value => Operators::IN()->value,
                    Operators::NOT_IN()->value => Operators::NOT_IN()->value,
                ])
                ->rules('required'),

            Text::make(__('Predicate'), 'predicate')
                ->rules('max:255')
                ->help('Value to compare against the subject.'),

            Select::make(__('Logical Operator'), 'logical_operator')
                ->options([
                    LogicalOperators::AND()->value => LogicalOperators::AND()->value,
                    LogicalOperators::OR()->value => LogicalOperators::OR()->value,
                ])
                ->rules('required'),

            MorphTo::make(__('Model'), 'model')
                ->types([
                    Metrics::class,
                ])
                ->sortable()
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
