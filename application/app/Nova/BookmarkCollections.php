<?php

declare(strict_types=1);

namespace App\Nova;

use App\Enums\BookmarkStatus;
use App\Enums\BookmarkVisibility;
use App\Enums\CommentsAllowance;
use App\Models\BookmarkCollection;
use App\Nova\Actions\EditModel;
use App\Nova\Actions\MakeSearchable;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\Color;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Scout\Builder;

class BookmarkCollections extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<BookmarkCollection>
     */
    public static $model = BookmarkCollection::class;

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
        'title',
    ];

    public static $perPageOptions = [25, 50, 100, 250];

    /**
     * The pagination per-page options used the resource via relationship.
     *
     * @var int
     *
     * @deprecated use `$perPageViaRelationshipOptions` instead.
     */
    public static $perPageViaRelationship = 6;

    /**
     * Build an "index" query for the given resource.
     */
    public static function indexQuery(NovaRequest $request, \Illuminate\Contracts\Database\Eloquent\Builder $query): \Illuminate\Contracts\Database\Eloquent\Builder
    {
        return $query->withoutGlobalScopes();
    }

    /**
     * Build a Scout search query for the given resource.
     *
     * @param  Builder  $query
     */
    public static function scoutQuery(NovaRequest $request, $query): Builder
    {
        return $query;
    }

    /**
     * Build a "detail" query for the given resource.
     */
    public static function detailQuery(NovaRequest $request, \Illuminate\Contracts\Database\Eloquent\Builder $query): \Illuminate\Contracts\Database\Eloquent\Builder
    {
        return $query->withoutGlobalScopes();
    }

    /**
     * Build a "relatable" query for the given resource.
     *
     * This query determines which instances of the model may be attached to other resources.
     */
    public static function relatableQuery(NovaRequest $request, \Illuminate\Contracts\Database\Eloquent\Builder $query): \Illuminate\Contracts\Database\Eloquent\Builder
    {
        return $query->withoutGlobalScopes();
    }

    /**
     * Get the fields displayed by the resource.
     *
     * @return array<int, Field>
     */
    public function fields(NovaRequest $request): array
    {
        return [
            ID::make()->sortable(),

            Text::make(__('Title'), 'title')
                ->sortable()
                ->rules('required', 'max:255'),

            Number::make(__('Items Count'), 'items_count')
                ->sortable()
                ->onlyOnIndex()
                ->displayUsing(fn ($value) => number_format($value ?? 0)),

            Textarea::make(__('Content'), 'content')
                ->alwaysShow()
                ->rules('nullable'),

            Color::make(__('Color'))
                ->sortable()
                ->rules('required', 'max:255'),

            Boolean::make(__('Allow Comments'), 'allow_comments')
//                ->options([
//                    CommentsAllowance::NO()->value => CommentsAllowance::NO()->value,
//                    CommentsAllowance::ME()->value => CommentsAllowance::ME()->value,
//                    CommentsAllowance::EVERYONE()->value => CommentsAllowance::EVERYONE()->value,
//                ])
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
                ->filterable()
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

            BelongsTo::make(__('Parent'), 'parent', BookmarkCollections::class)
                ->sortable()
                ->nullable()
                ->searchable(),

            Text::make(__('Type'), 'type')
                ->default(BookmarkCollections::class)
                ->rules('required', 'max:255')
                ->sortable(),

            DateTime::make(__('Created At'), 'created_at')
                ->sortable(),

            DateTime::make(__('Updated At'), 'updated_at')
                ->sortable(),

            HasMany::make(__('Items'), 'items', BookmarkItems::class)
                ->sortable(),

            HasMany::make(__('Comments'), 'comments', Comments::class)
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
            (new MakeSearchable),
        ];
    }
}
