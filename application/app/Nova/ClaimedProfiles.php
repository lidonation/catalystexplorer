<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Pivot\ClaimedProfile;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\MorphTo;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class ClaimedProfiles extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<ClaimedProfile>
     */
    public static $model = ClaimedProfile::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'id';

    /**
     * Get the displayable title for the resource.
     */
    public function title(): string
    {
        $userName = $this->user->name ?? $this->user->email ?? 'User #'.$this->user_id;
        $claimableType = class_basename($this->claimable_type);
        $claimableId = substr($this->claimable_id, 0, 8).'...';

        return "{$userName} → {$claimableType} ({$claimableId})";
    }

    /**
     * The columns that should be searched.
     *
     * @var array<int, string>
     */
    public static $search = [
        'user_id',
        'claimable_id',
        'claimable_type',
    ];

    /**
     * Get the displayable label of the resource.
     */
    public static function label(): string
    {
        return __('Claimed Profiles');
    }

    /**
     * Get the displayable singular label of the resource.
     */
    public static function singularLabel(): string
    {
        return __('Claimed Profile');
    }

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, Field>
     */
    public function fields(NovaRequest $request): array
    {
        return [
            Text::make(__('ID'), 'id')
                ->sortable()
                ->readonly()
                ->hideFromIndex()
                ->displayUsing(function ($value) {
                    return substr($value, 0, 8).'...';
                }),

            BelongsTo::make(__('User'), 'user', Users::class)
                ->searchable()
                ->sortable()
                ->required(),

            MorphTo::make(__('Claimable Profile'), 'claimable')
                ->types([
                    CatalystProfiles::class,
                    IdeascaleProfiles::class,
                ])
                ->sortable()
                ->searchable()
                ->filterable()
                ->required(),

            DateTime::make(__('Claimed At'), 'claimed_at')
                ->sortable()
                ->readonly()
                ->displayUsing(function ($value) {
                    return $value?->format('M j, Y g:i A');
                }),

            DateTime::make(__('Created At'), 'created_at')
                ->sortable()
                ->readonly()
                ->hideFromIndex(),

            DateTime::make(__('Updated At'), 'updated_at')
                ->sortable()
                ->readonly()
                ->hideFromIndex(),
        ];
    }

    /**
     * Get the cards available for the resource.
     */
    public function cards(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the filters available for the resource.
     */
    public function filters(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the lenses available for the resource.
     */
    public function lenses(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the actions available for the resource.
     */
    public function actions(NovaRequest $request): array
    {
        return [];
    }
}
