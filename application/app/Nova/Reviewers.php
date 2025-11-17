<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Reviewer;
use App\Nova\Actions\MakeSearchable;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class Reviewers extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Reviewer>
     */
    public static $model = Reviewer::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'catalyst_reviewer_id';

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id',
        'catalyst_reviewer_id',
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
            Text::make('Cat Id', 'catalyst_reviewer_id')
                ->sortable(),

            Number::make('Avg Reputation Score', 'avg_reputation_score')
                ->sortable()
                ->displayUsing(fn ($value) => $value ? "{$value}%" : 'N/A'),

            Number::make('Reviews Count', 'reviews_count')
                ->sortable()
                ->onlyOnIndex(),

            Number::make('Proposals Count', 'proposals_count')
                ->sortable(),

            BelongsTo::make(__('Claimed By'), 'claimedBy', Users::class)
                ->nullable()
                ->searchable()
                ->filterable(),

            HasMany::make(__('Reputation Scores'), 'reputation_scores', ReviewerReputationScores::class),

            HasMany::make(__('Reviews'), 'reviews', Reviews::class),

            HasMany::make(__('Proposals'), 'proposals', Proposals::class),
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
