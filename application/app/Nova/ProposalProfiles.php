<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Pivot\ProposalProfile;
use Laravel\Nova\Exceptions\HelperNotSupported;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\MorphTo;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class ProposalProfiles extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<ProposalProfile>
     */
    public static $model = ProposalProfile::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'id';

    /**
     * The columns that should be searched.
     *
     * @var array<int, string>
     */
    public static $search = [
        'id',
        'profile_type',
        'profile_id',
        'proposal_id',
    ];

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, Field>
     *
     * @throws HelperNotSupported
     */
    public function fields(NovaRequest $request): array
    {
        return [
            Text::make('ID', 'id')
                ->sortable()
                ->readonly()
                ->copyable()
                ->displayUsing(function ($value) {
                    return substr($value, 0, 8).'...';
                })
                ->help('UUID identifier for this Proposal Profile'),

            BelongsTo::make(__('Proposal'), 'proposal', Proposals::class)
                ->searchable()
                ->sortable()
                ->required(),

            MorphTo::make(__('Profile'), 'model')
                ->types([
                    CatalystProfiles::class,
                    IdeascaleProfiles::class,
                ])
                ->sortable()
                ->filterable()
                ->required(),
            Text::make('Profile Type', 'profile_type')
                ->sortable()
                ->readonly()
                ->hideFromIndex()
                ->displayUsing(function ($value) {
                    return class_basename($value);
                }),

            Text::make('Profile ID', 'profile_id')
                ->sortable()
                ->readonly()
                ->hideFromIndex()
                ->displayUsing(function ($value) {
                    return substr($value, 0, 8).'...';
                }),

            Text::make('Old ID', 'old_id')
                ->sortable()
                ->nullable()
                ->hideFromIndex()
                ->readonly(),
        ];
    }
}
