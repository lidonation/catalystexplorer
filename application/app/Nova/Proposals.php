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
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Slug;
use Laravel\Nova\Fields\Stack;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Fields\Url;
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
            // Basic Identification Fields
            Text::make('ID', 'id')
                ->sortable()
                ->readonly()
                ->copyable()
                ->hideWhenCreating(),

            Stack::make('Details', [
                Text::make(__('Title'), 'title')->displayUsing(fn ($name) => Str::limit($name, CatalystGlobals::PROPOSALS_SLUG_MAX_LENGTH()->value)
                ),
                Slug::make(__('Slug'), 'slug')->displayUsing(fn ($name) => Str::limit($name, CatalystGlobals::PROPOSALS_SLUG_MAX_LENGTH()->value)
                ),
            ])->onlyOnIndex(),

            // Core Content Fields
            Text::make(__('Title'), 'title')
                ->required()
                ->sortable()
                ->withMeta([
                    'extraAttributes' => [
                        'autocomplete' => 'off',
                    ],
                ]),

            Slug::make(__('Slug'), 'slug')
                ->from('title')
                ->hideFromIndex(),

            Text::make(__('Meta Title'), 'meta_title')
                ->hideFromIndex(),

            Textarea::make(__('Problem'), 'problem')
                ->hideFromIndex(),

            Textarea::make(__('Solution'), 'solution')
                ->hideFromIndex(),

            Textarea::make(__('Experience'), 'experience')
                ->hideFromIndex(),

            Textarea::make(__('Content'), 'content')
                ->hideFromIndex(),

            Text::make(__('Excerpt'), 'excerpt')
                ->hideFromIndex(),

            Text::make(__('Social Excerpt'), 'social_excerpt')
                ->hideFromIndex(),

            Textarea::make(__('Definition of Success'), 'definition_of_success')
                ->hideFromIndex(),

            Text::make(__('Comment Prompt'), 'comment_prompt')
                ->hideFromIndex(),

            // Financial Fields
            Number::make(__('Amount Requested'), 'amount_requested')
                ->sortable()
                ->displayUsing(fn ($value) => number_format($value ?? 0)),

            Number::make(__('Amount Received'), 'amount_received')
                ->sortable()
                ->displayUsing(fn ($value) => number_format($value ?? 0)),

            Number::make(__('Amount Requested USD'), 'amount_requested_usd')
                ->hideFromIndex()
                ->displayUsing(fn ($value) => '$'.number_format($value ?? 0)),

            Number::make(__('Amount Requested ADA'), 'amount_requested_ada')
                ->hideFromIndex()
                ->displayUsing(fn ($value) => number_format($value ?? 0).' ₳'),

            Number::make(__('Amount Received USD'), 'amount_received_usd')
                ->hideFromIndex()
                ->displayUsing(fn ($value) => '$'.number_format($value ?? 0)),

            Number::make(__('Amount Received ADA'), 'amount_received_ada')
                ->hideFromIndex()
                ->displayUsing(fn ($value) => number_format($value ?? 0).' ₳'),

            Number::make(__('Amount Awarded USD'), 'amount_awarded_usd')
                ->hideFromIndex()
                ->displayUsing(fn ($value) => '$'.number_format($value ?? 0)),

            Number::make(__('Amount Awarded ADA'), 'amount_awarded_ada')
                ->hideFromIndex()
                ->displayUsing(fn ($value) => number_format($value ?? 0).' ₳'),

            Number::make(__('Completed Amount Paid USD'), 'completed_amount_paid_usd')
                ->hideFromIndex()
                ->displayUsing(fn ($value) => '$'.number_format($value ?? 0)),

            Number::make(__('Completed Amount Paid ADA'), 'completed_amount_paid_ada')
                ->hideFromIndex()
                ->displayUsing(fn ($value) => number_format($value ?? 0).' ₳'),

            Select::make(__('Currency'), 'currency')
                ->options([
                    'ADA' => 'ADA',
                    'USD' => 'USD',
                ])
                ->displayUsingLabels(),

            // Project Information
            Number::make(__('Project Length'), 'project_length')
                ->help('Project duration in months')
                ->hideFromIndex(),

            Boolean::make(__('Open Source'), 'opensource')
                ->trueValue(true)
                ->falseValue(false),

            Text::make(__('Type'), 'type')
                ->hideFromIndex(),

            // Links and Media
            Url::make(__('Website'), 'website')
                ->displayUsing(fn ($value) => $value ? Str::limit($value, 50) : '')
                ->hideFromIndex(),

            Text::make(__('Quick Pitch'), 'quickpitch')
                ->hideFromIndex(),

            Number::make(__('Quick Pitch Length'), 'quickpitch_length')
                ->hideFromIndex(),

            Boolean::make(__('Has Quick Pitch'), 'has_quick_pitch')
                ->hideFromIndex(),

            // Status Fields
            Select::make(__('Status'), 'status')
                ->options([
                    'active' => 'Active',
                    'complete' => 'Complete',
                    'over_budget' => 'Over Budget',
                    'not_approved' => 'Not Approved',
                    'unfunded' => 'Unfunded',
                ])
                ->displayUsingLabels()
                ->filterable(),

            Select::make(__('Funding Status'), 'funding_status')
                ->options([
                    'funded' => 'Funded',
                    'not_funded' => 'Not Funded',
                    'over_budget' => 'Over Budget',
                ])
                ->displayUsingLabels()
                ->filterable(),

            Boolean::make(__('Paid'), 'paid')
                ->hideFromIndex(),

            Boolean::make(__('Over Budget'), 'over_budget')
                ->hideFromIndex(),

            // Rating Fields
            Number::make(__('CA Rating'), 'ca_rating')
                ->step(0.1)
                ->hideFromIndex(),

            Number::make(__('Alignment Score'), 'alignment_score')
                ->step(0.1)
                ->hideFromIndex(),

            Number::make(__('Feasibility Score'), 'feasibility_score')
                ->step(0.1)
                ->hideFromIndex(),

            Number::make(__('Auditability Score'), 'auditability_score')
                ->step(0.1)
                ->hideFromIndex(),

            Number::make(__('Ranking Total'), 'ranking_total')
                ->hideFromIndex(),

            // Vote Counts
            Number::make(__('Yes Votes'), 'yes_votes_count')
                ->hideFromIndex(),

            Number::make(__('No Votes'), 'no_votes_count')
                ->hideFromIndex(),

            Number::make(__('Abstain Votes'), 'abstain_votes_count')
                ->hideFromIndex(),

            Number::make(__('Votes Cast'), 'votes_cast')
                ->hideFromIndex(),

            // Special Proposal Types
            Boolean::make(__('Impact Proposal'), 'impact_proposal')
                ->hideFromIndex(),

            Boolean::make(__('Woman Proposal'), 'woman_proposal')
                ->hideFromIndex(),

            Boolean::make(__('Ideafest Proposal'), 'ideafest_proposal')
                ->hideFromIndex(),

            // Additional Fields
            Text::make(__('Hash'), 'hash')
                ->hideFromIndex(),

            Text::make(__('User ID'), 'user_id')
                ->hideFromIndex(),

            Text::make(__('Old ID'), 'old_id')
                ->hideFromIndex(),

            // Foreign Keys and Relationships
            BelongsTo::make(__('Fund'), 'fund', Funds::class)
                ->searchable()
                ->filterable(),

            BelongsTo::make(__('Campaign'), 'campaign', Campaigns::class)
                ->nullable()
                ->searchable()
                ->hideFromIndex(),

            BelongsTo::make(__('Schedule'), 'schedule', ProjectSchedules::class)
                ->nullable()
                ->hideFromIndex(),

            // Timestamps
            DateTime::make(__('Created At'), 'created_at')
                ->sortable()
                ->readonly()
                ->hideWhenCreating()
                ->hideFromIndex(),

            DateTime::make(__('Updated At'), 'updated_at')
                ->sortable()
                ->readonly()
                ->hideWhenCreating()
                ->hideWhenUpdating()
                ->hideFromIndex(),

            DateTime::make(__('Funded At'), 'funded_at')
                ->nullable()
                ->hideFromIndex(),

            DateTime::make(__('Funding Updated At'), 'funding_updated_at')
                ->nullable()
                ->hideFromIndex(),

            DateTime::make(__('Deleted At'), 'deleted_at')
                ->nullable()
                ->readonly()
                ->hideFromIndex(),

            // Computed/Virtual Fields
            Text::make('View Proposal', function () {
                return '<a style="color: #578ae4" href="'.$this->link.'" target="_blank">View</a>';
            })->asHtml()->hideWhenCreating()->hideWhenUpdating(),

            // Relationships
            HasMany::make(__('Team'), 'team', ProposalProfiles::class),

            HasMany::make('Metadata', 'metas', Metas::class),

            HasMany::make(__('Discussions'), 'discussions', Discussions::class),

            HasMany::make(__('Reviews'), 'reviews', Reviews::class),

            HasMany::make(__('Catalyst Tallies'), 'catalyst_tallies', CatalystTallies::class),
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
