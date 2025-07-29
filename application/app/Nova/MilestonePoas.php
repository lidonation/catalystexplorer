<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\MilestonePoa;
use App\Nova\Actions\MakeSearchable;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;

class MilestonePoas extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<MilestonePoa>
     */
    public static $model = MilestonePoa::class;

    public static $group = 'Milestone';

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
        'proposal_id',
        'milestone_id',
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

            Textarea::make(__('Content'))
                ->required(),

            Boolean::make(__('Current'))
                ->sortable()
                ->filterable(),

            BelongsTo::make(__('Milestone'), 'milestone', Milestones::class),

            BelongsTo::make(__('Proposal'), 'proposal', Proposals::class),

            HasMany::make(__('Signoffs'), 'signoffs', MilestonePoaSignoffs::class),

            HasMany::make(__('Reviews'), 'reviews', MilestonePoaReviews::class),
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
