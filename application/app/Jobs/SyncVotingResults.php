<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Http\Integrations\ProjectCatalyst\ProjectCatalystConnector;
use App\Http\Integrations\ProjectCatalyst\Requests\GetChallengeVotingDataRequest;
use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class SyncVotingResults implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;

    public int $tries = 3;

    public function __construct(
        protected string $challengeSlug,
        protected string $fundNumber,
        protected string $fundId,
        protected ?string $campaignSlug = null,
        protected bool $updateProposalDetails = false
    ) {}

    public function handle(): void
    {
        try {
            Log::info('Starting voting results sync', [
                'challenge' => $this->challengeSlug,
                'fund' => $this->fundNumber,
                'fund_id' => $this->fundId,
            ]);

            $connector = new ProjectCatalystConnector;
            $request = new GetChallengeVotingDataRequest($this->challengeSlug, $this->fundNumber);
            $response = $connector->send($request);

            $data = $response->json();

            if (! isset($data['data']['challenge']['projects'])) {
                throw new \Exception('No projects data found in API response');
            }

            $projects = $data['data']['challenge']['projects'];
            $successCount = 0;
            $errorCount = 0;

            foreach ($projects as $project) {
                try {
                    $this->processProject($project, $this->fundNumber, $this->fundId, $this->campaignSlug, $this->updateProposalDetails);
                    $successCount++;
                } catch (Throwable $e) {
                    $errorCount++;
                    Log::warning('Failed to process project voting data', [
                        'project' => $project['projectName'] ?? 'Unknown',
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            Log::info('Completed voting results sync', [
                'challenge' => $this->challengeSlug,
                'success' => $successCount,
                'errors' => $errorCount,
                'total' => count($projects),
            ]);

            if ($errorCount > 0 && $successCount === 0) {
                throw new \Exception("Failed to process any projects. Errors: {$errorCount}");
            }

        } catch (Throwable $e) {
            Log::error('Error in voting results sync', [
                'challenge' => $this->challengeSlug,
                'fund' => $this->fundNumber,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    protected function processProject(array $project, string $fundNumber, string $fundId, ?string $campaignSlug, bool $updateProposalDetails = false): void
    {
        if (! isset($project['voting'])) {
            Log::info('Voting data missing for project', ['project' => $project['projectName'] ?? 'Unknown']);

            return;
        }

        $slug = Str::limit(Str::slug($project['projectName']), 150, '')."-f{$fundNumber}";

        $proposal = Proposal::where('fund_id', $fundId)
            ->where('slug', $slug)
            ->first();

        if (! $proposal) {
            Log::info('Proposal not found for project', [
                'project' => $project['projectName'],
                'slug' => $slug,
                'fund_id' => $fundId,
            ]);

            return;
        }

        $votingData = $project['voting'];
        $this->updateProposalVotingData($proposal, $votingData, $campaignSlug, $updateProposalDetails, $project);

        Log::info('Updated proposal voting data', [
            'proposal_id' => $proposal->id,
            'project_name' => $project['projectName'],
            'funding_status' => $proposal->funding_status,
        ]);
    }

    protected function updateProposalVotingData(Proposal $proposal, array $votingData, ?string $campaignSlug, bool $updateProposalDetails = false, array $project = []): void
    {
        // Update vote counts (convert from micro-ADA to ADA)
        $proposal->yes_votes_count = isset($votingData['yes']['amount'])
            ? $votingData['yes']['amount'] / 1000000
            : null;

        $proposal->no_votes_count = isset($votingData['no']['amount'])
            ? $votingData['no']['amount'] / 1000000
            : null;

        $proposal->abstain_votes_count = isset($votingData['abstain']['amount'])
            ? $votingData['abstain']['amount'] / 1000000
            : null;

        // Determine funding status based on voting results
        if ($votingData['status'] === 'Funded') {
            $proposal->funding_status = 'funded';
        } else {
            if ($votingData['meetsApprovalThreshold'] ?? false) {
                $proposal->funding_status = 'over_budget';
            } else {
                $proposal->funding_status = 'not_approved';
            }
        }

        if ($proposal->funding_status === 'funded') {
            $proposal->funded_at = now();

            if ($campaignSlug === null || $campaignSlug === 'sponsored-by-leftovers') {
                $proposal->funding_status = 'leftover';
            }
        }

        $proposal->status = match ($proposal->funding_status) {
            'funded', 'leftover' => 'in_progress',
            default => 'unfunded'
        };

        if ($updateProposalDetails) {
            $this->updateProposalDetails($proposal, $project, $campaignSlug, $this->fundNumber);
        }

        $proposal->save();

        // Save additional metadata
        if (isset($votingData['votesCast'])) {
            $proposal->saveMeta('unique_wallets', (string) $votingData['votesCast']);
        }

        if (isset($votingData['fundDepletion']['amount'])) {
            $proposal->saveMeta('funds_remaining', (string) ($votingData['fundDepletion']['amount'] / 1000000));
        }

        if (isset($votingData['reasonForNotFundedStatus']) && $votingData['reasonForNotFundedStatus']) {
            $proposal->saveMeta('not_funded_reason', $votingData['reasonForNotFundedStatus']);
        }
    }

    protected function updateProposalDetails(Proposal $proposal, array $project, ?string $campaignSlug, string $fundNumber): void
    {
        $updated = false;

        // Update campaign ID if we have a campaign slug and it's different from current
        if ($campaignSlug) {
            // Append fund number to campaign slug (e.g., 'cardano-open-developers' becomes 'cardano-open-developers-f12')
            $fullCampaignSlug = $campaignSlug.'-f'.$fundNumber;
            $campaign = \App\Models\Campaign::where('slug', $fullCampaignSlug)->first();
            if ($campaign && $proposal->campaign_id !== $campaign->id) {
                $proposal->campaign_id = $campaign->id;
                $updated = true;
                Log::info('Updated proposal campaign', [
                    'proposal_id' => $proposal->id,
                    'old_campaign_id' => $proposal->getOriginal('campaign_id'),
                    'new_campaign_id' => $campaign->id,
                    'original_campaign_slug' => $campaignSlug,
                    'full_campaign_slug' => $fullCampaignSlug,
                ]);
            } elseif (! $campaign) {
                Log::debug('Campaign not found with full slug', [
                    'proposal_id' => $proposal->id,
                    'original_campaign_slug' => $campaignSlug,
                    'full_campaign_slug' => $fullCampaignSlug,
                    'fund_number' => $fundNumber,
                ]);
            }
        }

        // Update amount received from distributedToDate
        if (isset($project['funding']['distributedToDate']['amount'])) {
            $rawAmount = $project['funding']['distributedToDate']['amount'];

            // Only update if we have a valid positive integer (skips zero, negative, floats, strings, etc.)
            if (is_numeric($rawAmount) && $rawAmount > 0 && is_int($rawAmount)) {
                $amountReceived = $rawAmount / 1000000; // Convert from micro-ADA
                if ($proposal->amount_received !== $amountReceived) {
                    $proposal->amount_received = $amountReceived;
                    $updated = true;
                    Log::info('Updated proposal amount received', [
                        'proposal_id' => $proposal->id,
                        'old_amount' => $proposal->getOriginal('amount_received'),
                        'new_amount' => $amountReceived,
                        'raw_amount' => $rawAmount,
                    ]);
                }
            } else {
                Log::debug('Skipping amount received update - invalid value', [
                    'proposal_id' => $proposal->id,
                    'raw_amount' => $rawAmount,
                    'type' => gettype($rawAmount),
                    'is_numeric' => is_numeric($rawAmount),
                    'is_int' => is_int($rawAmount),
                ]);
            }
        }

        if ($updated) {
            Log::info('Proposal details updated', [
                'proposal_id' => $proposal->id,
                'project_name' => $project['projectName'] ?? 'Unknown',
            ]);
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('SyncVotingResults job failed', [
            'challenge' => $this->challengeSlug,
            'fund' => $this->fundNumber,
            'exception' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
