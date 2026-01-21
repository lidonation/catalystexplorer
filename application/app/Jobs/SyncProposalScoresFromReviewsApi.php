<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Http\Integrations\CatalystReviews\CatalystReviewsConnector;
use App\Http\Integrations\CatalystReviews\Requests\GetProposalScoresRequest;
use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncProposalScoresFromReviewsApi implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        protected string $proposalId,
        protected int $reviewModuleId
    ) {}

    public function handle(): void
    {
        try {
            $proposal = Proposal::find($this->proposalId);
            $connector = new CatalystReviewsConnector;
            $request = new GetProposalScoresRequest($this->reviewModuleId);
            $response = $connector->send($request);

            $data = $response->json();

            Log::info(json_encode($data));

            $scores = $data['score'];
            $updated = false;

            if (isset($scores['impact'])) {
                $proposal->saveMeta('alignment_score', $scores['impact']);
                $updated = true;
            }

            if (isset($scores['feasibility'])) {
                $proposal->saveMeta('feasibility_score', $scores['feasibility']);
                $updated = true;
            }

            if (isset($scores['value_for_money'])) {
                $proposal->saveMeta('auditability_score', $scores['value_for_money']);
                $updated = true;
            }

            if (isset($scores['overall'])) {
                $proposal->saveMeta('overall_score', $scores['overall_score']);
                $updated = true;
            }

            if ($updated) {
                Log::info('Successfully synced proposal scores from reviews API', [
                    'proposal_id' => $this->proposalId,
                    'review_module_id' => $this->reviewModuleId,
                    'alignment_score' => $scores['impact'] ?? null,
                    'auditability_score' => $scores['value_for_money'] ?? null,
                    'feasibility_score' => $scores['feasibility'] ?? null,
                ]);
            }

        } catch (\Throwable $e) {
            Log::error('Error syncing proposal scores from reviews API', [
                'proposal_id' => $this->proposalId,
                'review_module_id' => $this->reviewModuleId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SyncProposalScoresFromReviewsApi job failed', [
            'proposal_id' => $this->proposalId,
            'review_module_id' => $this->reviewModuleId,
            'error' => $exception->getMessage(),
        ]);
    }
}
