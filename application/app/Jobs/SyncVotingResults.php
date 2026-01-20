<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Http\Integrations\ProjectCatalyst\ProjectCatalystConnector;
use App\Http\Integrations\ProjectCatalyst\Requests\GetChallengeVotingDataRequest;
use App\Models\Campaign;
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
    }

    protected function updateProposalVotingData(Proposal $proposal, array $votingData, ?string $campaignSlug, bool $updateProposalDetails = false, array $project = []): void
    {
        // Update vote counts (convert from lovelaces to ADA)
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

        if ($updateProposalDetails) {
            $this->updateProposalDetails($proposal, $project, $campaignSlug, $this->fundNumber);
        }

        // Save proposal and additional metadata
        $this->saveAdditionalMetadata($proposal, $votingData);

        // Fetch and save proposal scores from REST API
        $this->fetchAndSaveProposalScores($proposal);
    }

    /**
     * Fetch proposal scores from Project Catalyst REST API and save to metadata
     */
    protected function fetchAndSaveProposalScores(Proposal $proposal): void
    {
        try {
            $chainProposalId = $proposal->getMeta('chain_proposal_id');

            if (! $chainProposalId) {
                Log::debug('Skipping score fetch - no chain_proposal_id found', [
                    'proposal_id' => $proposal->id,
                ]);

                return;
            }

            // Convert fund ID to fund number (e.g., "019a9c61..." -> "14")
            $fundNumber = $this->fundNumber;
            $fundId = 'fund'.$fundNumber;

            // Fetch filtered by fund to reduce payload size
            $response = \Illuminate\Support\Facades\Http::get('https://core.projectcatalyst.io/api/v0/proposals', [
                'fund' => $fundId,
            ]);

            if (! $response->successful()) {
                Log::warning('Failed to fetch proposals from REST API for scores', [
                    'proposal_id' => $proposal->id,
                    'status' => $response->status(),
                ]);

                return;
            }

            $proposals = json_decode($response->body(), true);

            // Find matching proposal by chain_proposal_id
            $matchingProposal = collect($proposals)->first(function ($item) use ($chainProposalId) {
                return ($item['chain_proposal_id'] ?? null) === $chainProposalId;
            });

            if (! $matchingProposal) {
                Log::debug('No matching proposal found in REST API by chain_proposal_id', [
                    'proposal_id' => $proposal->id,
                    'chain_proposal_id' => $chainProposalId,
                ]);

                return;
            }

            // Parse proposal_files_url to extract scores
            if (! isset($matchingProposal['proposal_files_url'])) {
                Log::debug('No proposal_files_url found in REST API data', [
                    'proposal_id' => $proposal->id,
                    'chain_proposal_id' => $chainProposalId,
                ]);

                return;
            }

            // Fix potential single quotes in JSON
            $jsonString = str_replace("'", '"', $matchingProposal['proposal_files_url']);
            $scores = json_decode($jsonString, true);

            if (! $scores) {
                Log::debug('Failed to decode proposal_files_url JSON', [
                    'proposal_id' => $proposal->id,
                    'chain_proposal_id' => $chainProposalId,
                    'json_error' => json_last_error_msg(),
                ]);

                return;
            }

            // Save individual scores to metadata
            if (isset($scores['alignment_score'])) {
                $proposal->saveMeta('alignment_score', $scores['alignment_score']);
            }

            if (isset($scores['auditability_score'])) {
                $proposal->saveMeta('auditability_score', $scores['auditability_score']);
            }

            if (isset($scores['feasibility_score'])) {
                $proposal->saveMeta('feasibility_score', $scores['feasibility_score']);
            }

            Log::info('Successfully saved proposal scores', [
                'proposal_id' => $proposal->id,
                'chain_proposal_id' => $chainProposalId,
                'alignment_score' => $scores['alignment_score'] ?? null,
                'auditability_score' => $scores['auditability_score'] ?? null,
                'feasibility_score' => $scores['feasibility_score'] ?? null,
            ]);

        } catch (\Throwable $e) {
            Log::error('Error fetching and saving proposal scores', [
                'proposal_id' => $proposal->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    protected function saveAdditionalMetadata(Proposal $proposal, array $votingData): void
    {
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

    protected function updateProposalDetails(Proposal &$proposal, array $project, ?string $campaignSlug, string $fundNumber): void
    {
        if ($campaignSlug) {
            $fullCampaignSlug = $campaignSlug.'-f'.$fundNumber;
            $campaign = Campaign::where('slug', $fullCampaignSlug)->first();
            if ($campaign && $proposal->campaign_id !== $campaign->id) {
                $proposal->campaign_id = $campaign->id;
            } elseif (! $campaign) {
                Log::debug('Campaign not found with full slug', [
                    'proposal_id' => $proposal->id,
                    'original_campaign_slug' => $campaignSlug,
                    'full_campaign_slug' => $fullCampaignSlug,
                    'fund_number' => $fundNumber,
                ]);
            }
        }

        // @todo restore when catalyst api is returning correct data
        //        $proposal->status = match (strtolower($project['projectStatus'])) {
        //            'active' => 'in_progress',
        //            'completed' => 'complete',
        //            'notapproved' => 'unfunded',
        //            default => strtolower($project['projectStatus'])
        //        };

        // Update amount received from distributedToDate
        if (isset($project['completed']['date'])) {
            $proposal->completed_at = $project['completed']['date'];
        }

        // Update amount received from distributedToDate
        if (isset($project['funding']['distributedToDate']['amount'])) {
            $rawAmount = $project['funding']['distributedToDate']['amount'];

            // Only update if we have a valid positive integer (skips zero, negative, floats, strings, etc.)
            if (is_numeric($rawAmount) && $rawAmount > 0 && is_int($rawAmount)) {
                $amountReceived = $rawAmount / 1000000; // Convert from micro-ADA
                if ($proposal->amount_received !== $amountReceived) {
                    $proposal->amount_received = $amountReceived;
                    $proposal->funding_updated_at = now();
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

        if ($campaignSlug && isset($project['projectSlug'])) {
            $projectCatalystUrl = "https://projectcatalyst.io/funds/{$fundNumber}/{$campaignSlug}/{$project['projectSlug']}";
            if ($proposal->projectcatalyst_io_link !== $projectCatalystUrl) {
                $proposal->projectcatalyst_io_link = $projectCatalystUrl;
            }
        } elseif ($campaignSlug || isset($project['projectSlug'])) {
            Log::debug('Cannot generate projectcatalyst.io link - missing required data', [
                'proposal_id' => $proposal->id,
                'has_campaign_slug' => ! empty($campaignSlug),
                'has_project_slug' => isset($project['projectSlug']),
                'campaign_slug' => $campaignSlug,
                'project_slug' => $project['projectSlug'] ?? null,
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
