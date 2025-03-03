<?php

declare(strict_types=1);

namespace App\Nova;

use App\Enums\BookmarkStatus;
use App\Enums\BookmarkVisibility;
use App\Enums\CommentsAllowance;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Color;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;

class BookmarkCollections extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<BookmarkCollection>
     */
    public static $model = \App\Models\BookmarkCollection::class;

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
        'title',
    ];

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
                ->rules('required', 'max:255'),

            Textarea::make(__('Content'), 'content')
                ->alwaysShow()
                ->rules('nullable'),

            Color::make(__('Color'))
                ->sortable()
                ->rules('required', 'max:255'),
            Select::make(__('Allow Comments'), 'allow-comments')
                ->options([
                    CommentsAllowance::NO()->value => CommentsAllowance::NO()->value,
                    CommentsAllowance::ME()->value => CommentsAllowance::ME()->value,
                    CommentsAllowance::EVERYONE()->value => CommentsAllowance::EVERYONE()->value,
                ])
                ->nullable()
                ->rules('nullable')
                ->sortable(),

            Select::make(__('Visibility'), 'visibility')
                ->options([
                    BookmarkVisibility::PUBLIC()->value => BookmarkVisibility::PUBLIC()->value,
                    BookmarkVisibility::UNLISTED()->value => BookmarkVisibility::UNLISTED()->value,
                    BookmarkVisibility::PRIVATE()->value => BookmarkVisibility::PRIVATE()->value,
                ])
                ->default(BookmarkVisibility::UNLISTED()->value)
                ->rules('required')
                ->sortable(),

            Select::make(__('Status'), 'status')
                ->options([
                    BookmarkStatus::DRAFT()->value => BookmarkStatus::DRAFT()->value,
                    BookmarkStatus::PUBLISHED()->value => BookmarkStatus::PUBLISHED()->value,
                    'published' => 'Published',
                ])
                ->default(BookmarkStatus::DRAFT()->value)
                ->rules('required')
                ->sortable(),

            BelongsTo::make(__('User'), 'user', Users::class)
                ->sortable()
                ->searchable()
                ->rules('required'),

            Text::make(__('Type'), 'type')
                ->default(BookmarkCollections::class)
                ->rules('required', 'max:255')
                ->sortable(),

            HasMany::make(__('Items'), 'items', BookmarkItems::class)
                ->sortable(),
        ];
    }

    /**
     * Get the cards available for the resource.
     *
     * @return array<int, \Laravel\Nova\Card>
     */
    public function cards(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the filters available for the resource.
     *
     * @return array<int, \Laravel\Nova\Filters\Filter>
     */
    public function filters(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the lenses available for the resource.
     *
     * @return array<int, \Laravel\Nova\Lenses\Lens>
     */
    public function lenses(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the actions available for the resource.
     *
     * @return array<int, \Laravel\Nova\Actions\Action>
     */
    public function actions(NovaRequest $request): array
    {
        return [];
    }
}
