<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\CatalystDrep;
use App\Nova\Actions\EditModel;
use App\Nova\Actions\MakeSearchable;
use App\Nova\Actions\UpdateModelMedia;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\BelongsToMany;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Fields\URL;
use Laravel\Nova\Http\Requests\NovaRequest;

class CatalystDreps extends Resource
{
    public static $perPageViaRelationship = 25;

    public static $with = ['author', 'signatures'];

    /**
     * The model the resource corresponds to.
     *
     * @var class-string<CatalystDrep>
     */
    public static $model = CatalystDrep::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'name';

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id',
        'name',
        'email',
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

            Text::make(__('Name'), 'name')
                ->sortable()
                ->required()
                ->rules('required', 'max:255'),

            Text::make(__('Email'), 'email')
                ->sortable()
                ->required()
                ->rules('required', 'email', 'max:254'),

            URL::make(__('Link'), 'link')
                ->displayUsing(fn ($url) => $url ? 'View Profile' : null)
                ->nullable(),

            Text::make(__('Stake Address'), 'stake_address')
                ->exceptOnForms()
                ->copyable(),

            Number::make(__('Voting Power'), 'voting_power')
                ->displayUsing(fn ($value) => number_format($value, 2))
                ->exceptOnForms(),

            Text::make(__('Last Active'), 'last_active')
                ->exceptOnForms(),

            Number::make(__('Delegators Count'), 'delegators')
                ->displayUsing(fn ($delegators) => is_array($delegators) ? count($delegators) : 0)
                ->exceptOnForms(),

            Textarea::make(__('Bio'), 'bio')
                ->help('Translatable field (JSON format)')
                ->nullable(),

            Textarea::make(__('Motivation'), 'motivation')
                ->help('Translatable field (JSON format)')
                ->nullable(),

            Textarea::make(__('Qualifications'), 'qualifications')
                ->help('Translatable field (JSON format)')
                ->nullable(),

            Textarea::make(__('Objective'), 'objective')
                ->help('Translatable field (JSON format)')
                ->nullable(),

            BelongsTo::make(__('Author'), 'author', Users::class)
                ->searchable()
                ->filterable(),

            BelongsToMany::make(__('Delegators'), 'delegators', Users::class),

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

    /**
     * Get the displayable label of the resource.
     */
    public static function label(): string
    {
        return __('Catalyst DReps');
    }

    /**
     * Get the displayable singular label of the resource.
     */
    public static function singularLabel(): string
    {
        return __('Catalyst DRep');
    }
}
