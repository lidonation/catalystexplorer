<?php

declare(strict_types=1);

namespace App\Nova;

use App\Enums\CatalystGlobals;
use App\Models\Proposal;
use App\Nova\Actions\EditModel;
use App\Nova\Actions\MakeSearchable;
use App\Nova\Actions\UpdateModelMedia;
use Illuminate\Support\Str;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Exceptions\HelperNotSupported;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\BelongsToMany;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\Slug;
use Laravel\Nova\Fields\Stack;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

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
                ->copyable(),

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
                ->required()
                ->withMeta(
                    [
                        'extraAttributes' => [
                            'autocomplete' => 'off',
                        ],
                    ]
                )
                ->onlyOnForms(),

            BelongsTo::make(__('Schedule'), 'schedule', ProjectSchedules::class),

            BelongsTo::make(__('Fund'), 'fund', Funds::class)
                ->searchable()
                ->filterable(),

            HasMany::make('Metadata', 'metas', Metas::class),

            BelongsToMany::make(__('Users'), 'users', Users::class),

            HasMany::make(__('Discussions'), 'discussions', Discussions::class),

            HasMany::make(__('Reviews'), 'reviews', Reviews::class),
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
}
