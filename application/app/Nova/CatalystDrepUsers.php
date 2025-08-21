<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\CatalystDrepUser;
use App\Nova\Actions\EditModel;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Http\Requests\NovaRequest;

class CatalystDrepUsers extends Resource
{
    public static $perPageViaRelationship = 25;

    public static $tableStyle = 'tight';

    public static $with = ['catalystDrep', 'user'];

    /**
     * The model the resource corresponds to.
     *
     * @var class-string<CatalystDrepUser>
     */
    public static $model = CatalystDrepUser::class;

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
        'catalyst_drep_stake_address',
        'user_stake_address',
    ];

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, Field>
     */
    public function fields(NovaRequest $request): array
    {
        return [
            Text::make('ID', 'id')
                ->sortable()
                ->readonly()
                ->copyable(),

            BelongsTo::make(__('Catalyst DRep'), 'catalystDrep', CatalystDreps::class)
                ->required()
                ->searchable()
                ->filterable()
                ->displayUsing(function ($drep) {
                    return $drep ? $drep->name : null;
                }),

            BelongsTo::make(__('User'), 'user', Users::class)
                ->required()
                ->searchable()
                ->filterable()
                ->displayUsing(function ($user) {
                    return $user ? $user->name : null;
                }),

            Text::make(__('DRep Stake Address'), 'catalyst_drep_stake_address')
                ->required()
                ->copyable()
                ->rules('required', 'string', 'max:255')
                ->help('The stake address of the Catalyst DRep'),

            Text::make(__('User Stake Address'), 'user_stake_address')
                ->required()
                ->copyable()
                ->rules('required', 'string', 'max:255')
                ->help('The stake address of the delegating user'),

            DateTime::make(__('Created At'), 'created_at')
                ->exceptOnForms()
                ->sortable(),

            DateTime::make(__('Updated At'), 'updated_at')
                ->onlyOnDetail(),
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
        ];
    }

    /**
     * Get the filters available for the resource.
     *
     * @return array
     */
    public function filters(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the lenses available for the resource.
     *
     * @return array
     */
    public function lenses(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the displayable label of the resource.
     */
    public static function label(): string
    {
        return __('DRep Delegations');
    }

    /**
     * Get the displayable singular label of the resource.
     */
    public static function singularLabel(): string
    {
        return __('DRep Delegation');
    }


    /**
     * Get the URI key for the resource.
     */
    public static function uriKey(): string
    {
        return 'catalyst-drep-users';
    }
}
