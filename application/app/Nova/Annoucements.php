<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Announcement;
use App\Nova\Actions\EditModel;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\KeyValue;
use Laravel\Nova\Fields\Markdown;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class Annoucements extends Resource
{
    public static $perPageViaRelationship = 25;

    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Announcement>
     */
    public static $model = Announcement::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'title';

    public static $perPageOptions = [25, 50, 100, 250];

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id',
        'title',
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
            Text::make(__('Title'))
                ->sortable()
                ->required(),
            Text::make(__('Label'))
                ->sortable(),
            DateTime::make(__('Created At'), 'created_at')
                ->sortable(),
            DateTime::make(__('Starts At'), 'event_starts_at')
                ->sortable(),
            DateTime::make(__('Ends At'), 'event_ends_at')
                ->sortable(),
            Text::make(__('Context'))
                ->required(),
            BelongsTo::make(__('User'), 'user', Users::class)
                ->searchable()
                ->filterable(),
            Markdown::make(__('Content'))
                ->required(),
            KeyValue::make(__('CTA'), 'cta')
                ->rules('json')
                ->help('looking for link, label, and title entries. Additional fields will be ignored'),
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
}
