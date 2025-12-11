<?php

declare(strict_types=1);

namespace App\Nova\Actions;

use App\Jobs\SyncVotingResults as SyncVotingResultsJob;
use App\Models\Fund;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Collection;
use Laravel\Nova\Actions\Action;
use Laravel\Nova\Actions\ActionResponse;
use Laravel\Nova\Fields\ActionFields;
use Laravel\Nova\Fields\Boolean;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class SyncVotingResults extends Action implements ShouldQueue
{
    use InteractsWithQueue, Queueable;

    public $name = 'Sync Voting Results';

    /**
     * The text to be used for the action's confirm button.
     */
    public $confirmButtonText = 'Sync Voting Data';

    /**
     * The text to be used for the action's confirmation text.
     */
    public $confirmText = 'This will fetch and update voting results from Project Catalyst API. This may take several minutes.';

    /**
     * Perform the action on the given models.
     */
    public function handle(ActionFields $fields, Collection $models): ActionResponse|array
    {
        $fundNumber = $fields->get('fund_number');
        $fundId = $fields->get('fund_id');
        $updateProposalDetails = $fields->get('update_proposal_details', false);

        if (! $fundNumber || ! $fundId) {
            return Action::danger('Fund number and fund ID are required.');
        }

        $challenges = $this->getFundChallenges($fundNumber);
        $jobsDispatched = 0;

        foreach ($challenges as $challengeSlug => $campaignSlug) {
            SyncVotingResultsJob::dispatch($challengeSlug, $fundNumber, $fundId, $challengeSlug, $updateProposalDetails);
            $jobsDispatched++;
        }

        if ($jobsDispatched === 0) {
            return Action::danger('No challenges found for the specified fund.');
        }

        return Action::message("{$jobsDispatched} voting sync jobs have been queued successfully.");
    }

    /**
     * Get the fields available on the action.
     */
    public function fields(NovaRequest $request): array
    {
        // Get fund options for the select field
        $funds = Fund::orderBy('created_at', 'desc')->get()->mapWithKeys(function ($fund) {
            return [$fund->id => $fund->title.' ('.$fund->id.')'];
        });

        return [
            Select::make('Fund', 'fund_id')
                ->options($funds->toArray())
                ->displayUsingLabels()
                ->help('Select the fund to sync voting results for')
                ->rules('required'),

            Text::make('Fund Number', 'fund_number')
                ->help('Enter the fund number (e.g., "14" for Fund 14)')
                ->placeholder('14')
                ->rules('required'),

            Boolean::make('Update Proposal Details', 'update_proposal_details')
                ->help('Also update campaign ID and amount received from API data')
                ->default(false),
        ];
    }

    /**
     * Get challenge mappings for a specific fund
     */
    protected function getFundChallenges(string $fundNumber): array
    {
        // Challenge mappings for different funds
        $challengeMappings = [
            '12' => [
                'cardano-open-ecosystem' => 'cardano-open-ecosystem-f12',
                'cardano-use-cases-product' => 'cardano-use-cases-product-f12',
                'cardano-use-cases-mvp' => 'cardano-use-cases-mvp-f12',
                'cardano-use-cases-concept' => 'cardano-use-cases-concept-f12',
                'cardano-partners-developers-real-world-intergrations' => 'cardano-partners-developers-real-world-intergrations-f12',
                'cardano-open-developers' => 'cardano-open-developers-f12',
                'sponsored-by-leftovers' => null,
            ],
            '13' => [
                'cardano-open-developers' => 'cardano-open-developers-f13',
                'cardano-open-ecosystem' => 'cardano-open-echo-system-f13',
                'cardano-use-cases-concept' => 'cardano-use-cases-concept-f13',
                'cardano-use-cases-product' => 'cardano-use-cases-product-f13',
                'cardano-partners-enterprise-randd' => 'cardano-partners-enterprise-f13',
                'cardano-partners-growth-and-acceleration' => 'cardano-partners-growth-f13',
                'sponsored-by-leftovers' => null,
            ],
            '14' => [
                'cardano-open-developers' => 'cardano-open-developers-f14',
                'cardano-open-ecosystem' => 'cardano-open-ecosystem-f14',
                'cardano-use-cases-concepts' => 'cardano-use-case-concept-f14',
                'cardano-use-cases-partners-and-products' => 'cardano-use-case-partners-and-products-f14',
                'sponsored-by-leftovers' => null,
            ],
            // Add more fund mappings here as needed
            // '15' => [...],
        ];

        return $challengeMappings[$fundNumber] ?? [];
    }

    /**
     * Indicate that this action can be run without any models.
     */
    public function standalone(): bool
    {
        return true;
    }

    /**
     * Get the displayable name of the action.
     */
    public function name(): string
    {
        return 'Sync Voting Results from Project Catalyst';
    }
}
