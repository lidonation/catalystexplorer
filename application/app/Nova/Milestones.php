<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Milestone;
use App\Nova\Actions\MakeSearchable;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;

class Milestones extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Milestone>
     */
    public static $model = Milestone::class;

    public static $group = 'Milestone';

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'title';

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id',
        'proposal_id',
        'title',
        'url',
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

            Textarea::make(__('Outputs')),
            Textarea::make(__('Success Criteria')),
            Textarea::make(__('Evidence')),

            Boolean::make('completed', fn () => $this->completed),

            Text::make(__('Completion Percent'), 'completion_percent', fn () => ("{$this->completion_percent}%")),

            Text::make('Status', 'status')
                ->sortable()
                ->filterable(),

            Boolean::make(__('Current'))
                ->sortable()
                ->filterable(),

            BelongsTo::make(__('Schedule'), 'project_schedule', ProjectSchedules::class),

            BelongsTo::make(__('Proposal'), 'proposal', Proposals::class),

            BelongsTo::make(__('Fund'), 'fund', Funds::class),

            HasMany::make(__('Proof of Acchievements'), 'poas', MilestonePoas::class),
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
            (new MakeSearchable),
        ];
    }
}
