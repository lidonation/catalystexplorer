<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\CatalystTally;
use App\Nova\Actions\EditModel;
use App\Nova\Actions\MakeSearchable;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Actions\ExportAsCsv;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class CatalystTallies extends Resource
{
    public static $perPageViaRelationship = 50;

    public static $tableStyle = 'tight';

    public static $with = ['fund', 'proposal'];

    /**
     * The model the resource corresponds to.
     *
     * @var class-string<CatalystTally>
     */
    public static $model = CatalystTally::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'hash';

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id',
        'hash',
        'tally',
    ];

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, Field>
     */
    public function fields(NovaRequest $request): array
    {
        return [
            ID::make('ID', 'id')
                ->sortable()
                ->readonly(),

            Text::make(__('Hash'), 'hash')
                ->rules('required', 'string')
                ->sortable()
                ->help('The unique hash identifier for this tally'),

            Number::make(__('Tally'), 'tally')
                ->rules('required', 'integer')
                ->sortable()
                ->help('The tally count/score'),

            BelongsTo::make(__('Proposal'), 'proposal', Proposals::class)
                ->searchable()
                ->nullable()
                ->help('The related proposal for this tally'),

            BelongsTo::make(__('Fund'), 'fund', Funds::class)
                ->searchable()
                ->filterable()
                ->nullable()
                ->help('The fund context for this tally'),

            Text::make(__('Model Type'), 'model_type')
                ->onlyOnDetail()
                ->help('The type of model this tally is associated with'),

            Text::make(__('Model ID'), 'model_id')
                ->onlyOnDetail()
                ->help('The ID of the associated model'),

            Text::make(__('Context ID'), 'context_id')
                ->onlyOnDetail()
                ->help('The context ID (typically fund ID)'),

            HasMany::make('Metadata', 'metas', Metas::class),
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
            (new MakeSearchable),
            ExportAsCsv::make()->nameable(),
        ];
    }
}
