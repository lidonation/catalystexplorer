<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\MilestonePoasReview;
use App\Nova\Actions\MakeSearchable;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class MilestonePoaSignoffs extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<MilestonePoasReview>
     */
    public static $model = MilestonePoasReview::class;

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
        'milestone_poa_id',
        'content_comment',
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

            Text::make(__('User ID'), 'user_id'),

            BelongsTo::make(__('POA'), 'poa', MilestonePoas::class),
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
