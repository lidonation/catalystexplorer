<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\CardanoBudgetProposal;
use App\Nova\Actions\EditModel;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\DateTime;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Markdown;
use Laravel\Nova\Fields\Number;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class CardanoBudgetProposals extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var class-string<CardanoBudgetProposal>
     */
    public static $model = CardanoBudgetProposal::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'proposal_name';

    public static $perPageOptions = [25, 50, 100, 250];

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'govtool_username',
        'govtool_proposal_id',
        'proposal_name',
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

            Text::make(__('Title'), 'proposal_name')
                ->sortable(),

            Text::make(__('Username'), 'govtool_username')
                ->sortable(),

            ID::make('govtool_user_id')->sortable(),
            ID::make('govtool_proposal_id')->sortable(),

            Boolean::make(__('Active'), 'is_active')
                ->sortable()
                ->filterable(),

            Boolean::make(__('Accepts Policy'), 'privacy_policy')
                ->sortable()
                ->filterable(),

            Boolean::make(__('Intersect is Admin'), 'intersect_named_administrator')
                ->sortable()
                ->filterable(),

            Number::make(__('Ada Amount'), 'ada_amount')
                ->sortable(),

            Number::make(__('Prefer Currency Amount'), 'amount_in_preferred_currency')
                ->sortable(),

            DateTime::make('Updated At')->sortable(),
            DateTime::make('Created At')->sortable(),

            Text::make(__('USD to Ada'), 'usd_to_ada_conversion_rate')
                ->sortable(),

            Text::make(__('Category'), 'budget_cat')
                ->sortable()
                ->filterable(),

            Text::make(__('Committee'), 'committee_name')
                ->sortable()
                ->filterable(),

            Text::make(__('Related Roadmap')),

            Number::make(__('Comments Count'), 'prop_comments_number'),

            Text::make(__('Country')),
            Text::make(__('Contract Type')),
            Markdown::make(__('Problem Statement')),
            Markdown::make(__('Proposal Benefit')),
            Markdown::make(__('Cost Breakdown')),
            Markdown::make(__('Experience')),
            Markdown::make(__('Explain Proposal Roadmap')),
            Markdown::make(__('Maintain And Support')),
            Markdown::make(__('Supplementary Endorsement')),
            Markdown::make(__('Proposal Description')),
            Markdown::make(__('Key Proposal Deliverables')),
            Markdown::make(__('Resourcing Duration Estimates')),
            Markdown::make(__('Key Dependencies')),
            Markdown::make(__('Other Contract Type')),

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
