<?php

declare(strict_types=1);

namespace App\Nova;

use App\Enums\CatalystGlobals;
use App\Enums\RoleEnum;
use App\Models\Proposal;
use App\Nova\Actions\AddQuickPitch;
use App\Nova\Actions\EditModel;
use App\Nova\Actions\GenerateProposalLinks;
use App\Nova\Actions\MakeSearchable;
use App\Nova\Actions\RegenerateOgImage;
use App\Nova\Actions\SyncMilestoneFromCatalyst;
use App\Nova\Actions\SyncProposalFromCatalyst;
use App\Nova\Actions\SyncVotingResults;
use App\Nova\Actions\UpdateModelMedia;
use App\Nova\Filters\FundFilter;
use App\Nova\Filters\FundingStatusBooleanFilter;
use App\Nova\Filters\QuickPitchFilter;
use App\Nova\Filters\StatusBooleanFilter;
use App\Nova\Metrics\ProposalCompletionProgress;
use App\Nova\Metrics\ProposalFundingStatusPartition;
use App\Nova\Metrics\ProposalProjectStatusPartition;
use Illuminate\Support\Str;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Exceptions\HelperNotSupported;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\HasOne;
use Laravel\Nova\Fields\Image;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Slug;
use Laravel\Nova\Fields\Stack;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Textarea;
use Laravel\Nova\Filters\Filter;
use Laravel\Nova\Http\Requests\NovaRequest;

class Proposals extends Resource
{
    public static $perPageViaRelationship = 25;

    public static $scoutSearchResults = 50;

    /**
     * The pagination options for the resource.
     *
     * @var array
     */
    public static $perPageOptions = [25, 50, 100, 250, 500];

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
                ->sortable()
                ->displayUsing(function ($value) {
                    if (strlen($value) > 30) {
                        return substr($value, 0, 30).'...';
                    }

                    return $value;
                }),

            Text::make(__('Title'), 'title')
                ->required()
                ->hideFromIndex()
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

            DateTime::make('Created At')
                ->sortable(),

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

            Number::make(__('projectcatalyst.io link'), 'projectcatalyst_io_link')
                ->hideFromIndex(),

            // Financial Fields
            Number::make(__('Amount Requested'), 'amount_requested')
                ->sortable()
                ->displayUsing(fn ($value) => number_format($value ?? 0)),

            Number::make(__('Amount Received'), 'amount_received')
                ->sortable()
                ->displayUsing(fn ($value) => number_format($value ?? 0)),

            Select::make(__('Currency'), 'currency')
                ->options([
                    'ADA' => 'ADA',
                    'USD' => 'USD',
                    'USDM' => 'USDM',
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
            Text::make(__('Website'), 'website')
                ->displayUsing(fn ($value) => $value ? Str::limit($value, 50) : '')
                ->rules('nullable', 'url')
                ->hideFromIndex(),

            Text::make(__('Quick Pitch'), 'quickpitch')
                ->hideFromIndex(),

            Number::make(__('Quick Pitch Length'), 'quickpitch_length')
                ->hideFromIndex(),

            Boolean::make(__('Has Quick Pitch'), function () {
                return $this->has_quick_pitch ?? false;
            })->hideFromIndex()
                ->readonly()
                ->hideWhenCreating()
                ->hideWhenUpdating(),

            Image::make(__('Social Media Card'), function () {
                // Generate the OG image URL using the proposal's slug
                if ($this->slug) {
                    return url("/og-image/proposals/{$this->slug}");
                }

                return null;
            })->preview(function () {
                if ($this->slug) {
                    return url("/og-image/proposals/{$this->slug}");
                }

                return null;
            })->hideFromIndex()
                ->readonly()
                ->hideWhenCreating()
                ->hideWhenUpdating()
                ->help('Generated social media preview card (Open Graph/Twitter Card)'),

            // Status Fields
            Select::make(__('Status'), 'status')
                ->options([
                    'pending' => 'Pending',
                    'active' => 'Active',
                    'complete' => 'Complete',
                    'over_budget' => 'Over Budget',
                    'not_approved' => 'Not Approved',
                    'unfunded' => 'Unfunded',
                    'in_progress' => 'In Progress',
                ])
                ->displayUsingLabels(),

            Select::make(__('Funding Status'), 'funding_status')
                ->options([
                    'funded' => 'Funded',
                    'pending' => 'Pending',
                    'not_funded' => 'Not Funded',
                    'not_approved' => 'Not Approved',
                    'over_budget' => 'Over Budget',
                    'leftover' => 'Leftover',
                    'withdrawn' => 'Withdrawn',
                ])
                ->displayUsingLabels(),

            Boolean::make(__('Paid'), function () {
                return $this->paid ?? false;
            })->hideFromIndex()
                ->readonly()
                ->hideWhenCreating()
                ->hideWhenUpdating(),

            Boolean::make(__('Over Budget'), function () {
                return $this->over_budget ?? false;
            })->hideFromIndex()
                ->readonly()
                ->hideWhenCreating()
                ->hideWhenUpdating(),

            // Rating Fields (computed from model attributes)
            Number::make(__('CA Rating'), function () {
                return $this->ca_rating ?? null;
            })->step(0.1)
                ->hideFromIndex()
                ->readonly()
                ->hideWhenCreating()
                ->hideWhenUpdating(),

            Number::make(__('Alignment Score'), function () {
                return $this->alignment_score ?? null;
            })->step(0.1)
                ->hideFromIndex()
                ->readonly()
                ->hideWhenCreating()
                ->hideWhenUpdating(),

            Number::make(__('Feasibility Score'), function () {
                return $this->feasibility_score ?? null;
            })->step(0.1)
                ->hideFromIndex()
                ->readonly()
                ->hideWhenCreating()
                ->hideWhenUpdating(),

            Number::make(__('Auditability Score'), function () {
                return $this->auditability_score ?? null;
            })->step(0.1)
                ->hideFromIndex()
                ->readonly()
                ->hideWhenCreating()
                ->hideWhenUpdating(),

            Number::make(__('Ranking Total'), 'ranking_total')
                ->hideFromIndex(),

            // Vote Counts
            Number::make(__('Yes Votes'), 'yes_votes_count')
                ->hideFromIndex(),

            Number::make(__('No Votes'), 'no_votes_count')
                ->hideFromIndex(),

            Number::make(__('Abstain Votes'), 'abstain_votes_count')
                ->hideFromIndex(),

            Number::make(__('Votes Cast'), function () {
                return $this->votes_cast ?? 0;
            })->hideFromIndex()
                ->readonly()
                ->hideWhenCreating()
                ->hideWhenUpdating(),

            // Special Proposal Types (computed from model attributes)
            Boolean::make(__('Impact Proposal'), function () {
                return $this->impact_proposal ?? false;
            })->hideFromIndex()
                ->readonly()
                ->hideWhenCreating()
                ->hideWhenUpdating(),

            Boolean::make(__('Woman Proposal'), function () {
                return $this->woman_proposal ?? false;
            })->hideFromIndex()
                ->readonly()
                ->hideWhenCreating()
                ->hideWhenUpdating(),

            Boolean::make(__('Ideafest Proposal'), function () {
                return $this->ideafest_proposal ?? false;
            })->hideFromIndex()
                ->readonly()
                ->hideWhenCreating()
                ->hideWhenUpdating(),

            // Additional Fields
            Text::make(__('Hash'), function () {
                return $this->hash ?? null;
            })->hideFromIndex()
                ->readonly()
                ->hideWhenCreating()
                ->hideWhenUpdating(),

            Text::make(__('User ID'), 'user_id')
                ->hideFromIndex(),

            //            HasManySearchable::make(__('Team'), 'team')
            //                ->relationshipConfig(
            //                    resourceClass: ProposalProfiles::class,
            //                    foreignKey: 'proposal_id',
            //                    displayCallback: function ($coupon) {
            //                        return "{$coupon?->Name} (Type: {$coupon->Type})";
            //                    }
            //                )
            //                ->withCreateButton(true, 'Add a team member'),

            Text::make(__('Old ID'), 'old_id')
                ->hideFromIndex(),

            // Foreign Keys and Relationships
            BelongsTo::make(__('Fund'), 'fund', Funds::class)
                ->searchable(),

            BelongsTo::make(__('Campaign'), 'campaign', Campaigns::class)
                ->nullable()
                ->searchable()
                ->hideFromIndex(),

            HasOne::make(__('Project Schedule'), 'schedule', ProjectSchedules::class)
                ->nullable(),

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
                ->filterable()
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

            HasMany::make(__('Links'), 'links', Links::class),

            // Relationships
            HasMany::make(__('Team'), 'team', ProposalProfiles::class),

            HasMany::make('Metadata', 'metas', Metas::class),

            HasMany::make(__('Discussions'), 'discussions', Discussions::class),

            HasMany::make(__('Reviews'), 'reviews', Reviews::class),

            HasMany::make(__('Catalyst Tallies'), 'catalyst_tallies', CatalystTallies::class),
        ];
    }

    /**
     * Get the cards available for the resource.
     *
     * @return array<int, \Laravel\Nova\Card>
     */
    public function cards(NovaRequest $request): array
    {
        return [
            (new ProposalCompletionProgress)->refreshWhenFiltersChange(),
            (new ProposalFundingStatusPartition)->refreshWhenFiltersChange(),
            (new ProposalProjectStatusPartition)->refreshWhenFiltersChange(),
        ];
    }

    /**
     * Get the filters available for the resource.
     *
     * @return array<int, Filter>
     */
    public function filters(NovaRequest $request): array
    {
        return [
            new FundFilter,
            new StatusBooleanFilter,
            new FundingStatusBooleanFilter,
            new QuickPitchFilter,
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
            AddQuickPitch::make()->canSee(function () {
                return auth()->user()->hasRole(RoleEnum::super_admin()->value)
                    || auth()->user()->hasRole(RoleEnum::editor()->value);
            }),
            (new EditModel),
            (new GenerateProposalLinks),
            (new MakeSearchable),
            (new RegenerateOgImage),
            (new SyncMilestoneFromCatalyst),
            (new SyncProposalFromCatalyst),
            (new SyncVotingResults),
            (new UpdateModelMedia),
        ];
    }
}
