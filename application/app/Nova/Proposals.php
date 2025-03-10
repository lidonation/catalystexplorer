<?php

declare(strict_types=1);

namespace App\Nova;

use App\Enums\CatalystGlobals;
use App\Models\Proposal;
use App\Nova\Actions\UpdateModelMedia;
use Illuminate\Support\Str;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Card;
use Laravel\Nova\Exceptions\HelperNotSupported;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Slug;
use Laravel\Nova\Fields\Stack;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Filters\Filter;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Lenses\Lens;

class Proposals extends Resource
{
    public static $perPageViaRelationship = 25;

    public static $scoutSearchResults = 50;

    public static $tableStyle = 'tight';

    public static $with = ['fund'];

    /**
     * The model the resource corresponds to.
     *
     * @var class-string<Proposal>
     */
    public static $model = Proposal::class;

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
            ID::make()->sortable(),

            Stack::make('Details', [
                Text::make(__('Title'), 'title')->displayUsing(fn ($name) => Str::limit($name, CatalystGlobals::PROPOSALS_SLUG_MAX_LENGTH()->value)
                ),
                Slug::make(__('Slug'), 'slug')->displayUsing(fn ($name) => Str::limit($name, CatalystGlobals::PROPOSALS_SLUG_MAX_LENGTH()->value)
                ),
            ]),

            Text::make('View Proposal', function () {
                return '<a style="color: #578ae4" href="'.$this->link.'" target="_blank">View</a>';
            })->asHtml()->hideWhenCreating()->hideWhenUpdating(),

            Text::make(__('Title'), 'title')
//                ->translatable()
                ->required()
                ->withMeta(
                    [
                        'extraAttributes' => [
                            'autocomplete' => 'off',
                        ],
                    ]
                )
                ->onlyOnForms(),

            BelongsTo::make(__('Fund'), 'fund', Funds::class)
                ->searchable()
                ->filterable(),

            HasMany::make('Metadata', 'metas', Metas::class),
        ];
    }

    /**
     * Get the cards available for the resource.
     *
     * @return array<int, Card>
     */
    public function cards(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the filters available for the resource.
     *
     * @return array<int, Filter>
     */
    public function filters(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the lenses available for the resource.
     *
     * @return array<int, Lens>
     */
    public function lenses(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the actions available for the resource.
     *
     * @return array<int, Action>
     */
    public function actions(NovaRequest $request): array
    {
        return [
            (new UpdateModelMedia),
        ];
    }
}
