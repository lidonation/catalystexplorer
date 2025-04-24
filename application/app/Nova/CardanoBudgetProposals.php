<?php

declare(strict_types=1);

namespace App\Nova;

use App\Models\CardanoBudgetProposal;
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
    public static $title = 'id';

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
            Text::make(__('Ttitle'), 'proposal_name')
                ->sortable(),
            ID::make('govtool_user_id')->sortable(),
            ID::make('govtool_proposal_id')->sortable(),
            Number::make(__('Ada Amount'), 'ada_amount')
                ->sortable(),
            DateTime::make('Updated At')->sortable(),
            DateTime::make('Created At')->sortable(),
            Text::make(__('Username'), 'govtool_username')
                ->sortable(),
            Text::make(__('Category'), 'budget_cat')
                ->sortable()
                ->filterable(),

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
}
