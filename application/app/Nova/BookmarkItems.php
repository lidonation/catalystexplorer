<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\BookmarkItem;
use App\Nova\Actions\EditModel;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\MorphTo;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;

class BookmarkItems extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<BookmarkItem>
     */
    public static $model = BookmarkItem::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'id';

    public static $with = ['collection'];

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
     * The pagination per-page options used the resource via relationship.
     *
     * @var int
     *
     * @deprecated use `$perPageViaRelationshipOptions` instead.
     */
    public static $perPageViaRelationship = 25;

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, \Laravel\Nova\Fields\Field>
     */
    public function fields(NovaRequest $request): array
    {
        return [
            ID::make()->sortable(),

            Text::make(__('Title'), 'title')
                ->sortable()
                ->rules('nullable', 'max:255'),

            Textarea::make(__('Content'), 'content')
                ->alwaysShow()
                ->rules('nullable'),

            BelongsTo::make(__('User'), 'user', Users::class)
                ->sortable()
                ->rules('required'),

            BelongsTo::make(__('Bookmark Collection'), 'collection', BookmarkCollections::class)
                ->nullable()
                ->rules('nullable'),

            MorphTo::make(__('Model'), 'model')
                ->types([
                    Proposals::class,
                    IdeascaleProfiles::class,
                    Groups::class,
                    Reviews::class,
                    BookmarkCollections::class,
                ])
                ->sortable()
                ->rules('required'),

            Number::make(__('Action'), 'action')
                ->sortable()
                ->rules('nullable', 'integer'),

            DateTime::make(__('Created At'), 'created_at')
                ->sortable(),

            DateTime::make(__('Updated At'), 'updated_at')
                ->sortable(),
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
