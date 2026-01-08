<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\Comment;
use App\Nova\Actions\EditModel;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\MorphTo;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Http\Requests\NovaRequest;

class Comments extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Comment>
     */
    public static $model = Comment::class;

    /**
     * Get the value that should be displayed to represent the resource.
     *
     * @return string
     */
    public function title()
    {
        $text = $this->text ?? '';

        // Use mb_substr for proper UTF-8 handling
        return mb_substr(strip_tags($text), 0, 50).(mb_strlen(strip_tags($text)) > 50 ? '...' : '');
    }

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id',
        'text',
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
     * @return array<int, Field>
     */
    public function fields(NovaRequest $request): array
    {
        return [
            Text::make(__('ID'), 'id')
                ->sortable()
                ->readonly(),

            Textarea::make(__('Comment'), 'text')
                ->alwaysShow()
                ->rules('required'),

            BelongsTo::make(__('Commentator'), 'commentator', Users::class)
                ->sortable()
                ->searchable()
                ->rules('required'),

            MorphTo::make(__('Commentable'), 'commentable')
                ->types([
                    Proposals::class,
                    BookmarkCollections::class,
                    Groups::class,
                    IdeascaleProfiles::class,
                ])
                ->sortable()
                ->rules('required'),

            //            BelongsTo::make(__('Parent Comment'), 'parent', Comments::class)
            //                ->nullable()
            //                ->sortable()
            //                ->searchable(),

            DateTime::make(__('Approved At'), 'approved_at')
                ->nullable()
                ->sortable(),

            DateTime::make(__('Created At'), 'created_at')
                ->sortable()
                ->exceptOnForms(),

            DateTime::make(__('Updated At'), 'updated_at')
                ->sortable()
                ->exceptOnForms(),

            HasMany::make(__('Nested Comments'), 'nestedComments', Comments::class),
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
