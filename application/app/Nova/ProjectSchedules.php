<?php

declare(strict_types=1);

namespace App\Nova;

use App\Enums\StatusEnum;
use App\Models\ProjectSchedule;
use App\Nova\Actions\MakeSearchable;
use App\Nova\Actions\UpdateModelMedia;
use Ebess\AdvancedNovaMediaLibrary\Fields\Images;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class ProjectSchedules extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<ProjectSchedule>
     */
    public static $model = ProjectSchedule::class;

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
                ->hideFromIndex()
                ->sortable()
                ->required(),

            Boolean::make('completed', fn () => $this->completed),

            Text::make(__('Url'), 'url')->hideFromIndex(),

            Select::make('Status', 'status')
                ->options(StatusEnum::toArray())
                ->default(StatusEnum::draft())
                ->sortable(),

            BelongsTo::make(__('Proposal'), 'proposal', Proposals::class),
            //                ->displayUsing(function ($proposal) {
            //                    if (strlen($proposal->titl) > 30) {
            //                        return substr($value, 0, 30) . '...';
            //                    }
            //                    return $value;
            //                }),

            BelongsTo::make(__('Fund'), 'fund', Funds::class),

            HasMany::make(__('Milestones'), 'milestones', Milestones::class),
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

    /**
     * Get the actions available for the resource.
     *
     * @return array<int, Action>
     */
    public function actions(NovaRequest $request): array
    {
        return [
            (new UpdateModelMedia),
            (new MakeSearchable),
        ];
    }
}
