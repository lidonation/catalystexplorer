<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\MilestoneRoleEnum;
use App\Http\Integrations\CatalystMilestone\CatalystMilestoneModuleConnector;
use App\Http\Integrations\CatalystMilestone\Requests\GetMilestoneDetailsRequest;
use App\Models\Milestone;
use App\Models\MilestonePoa;
use App\Models\MilestonePoasReview;
use App\Models\MilestonePoasSignoff;
use App\Models\MilestoneSomReview;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncCatalystMilestoneJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     */
    public $timeout = 300; // 5 minutes

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(
        protected array $projectSchedule
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $proposal_id = $this->projectSchedule['proposal_id'];
        $api_proposal_id = (int) ($this->projectSchedule['api_proposal_id'] ?? null);

        if (! $api_proposal_id) {
            logger()->warning("No api_proposal_id found for project schedule {$this->projectSchedule['project_schedule_id']}");

            return;
        }

        // Fetch all milestone details (including archived/rejected ones)
        // The API uses api_proposal_id (integer) to fetch milestones via /v1/soms endpoint
        $allMilestones = $this->fetchAllMilestonesSequentially($api_proposal_id);

        // Process all fetched milestones
        foreach ($allMilestones as $milestone) {
            $this->processMilestone($milestone, $proposal_id);
        }
    }

    /**
     * Fetch all milestone details sequentially.
     * The API returns an array of milestone submissions (including archived/rejected) for each milestone number.
     * Continues fetching milestones until empty responses are received.
     */
    protected function fetchAllMilestonesSequentially(int $api_proposal_id): array
    {
        $milestoneConnector = new CatalystMilestoneModuleConnector;
        $results = [];
        $milestoneNum = 1;
        $maxMilestones = 50;
        $consecutiveEmpty = 0;
        $maxConsecutiveEmpty = 3;

        // Fetch milestones sequentially until we get empty responses
        while ($milestoneNum <= $maxMilestones && $consecutiveEmpty < $maxConsecutiveEmpty) {
            try {
                $response = $milestoneConnector->send(
                    new GetMilestoneDetailsRequest($api_proposal_id, $milestoneNum)
                );
                $data = $response->json();

                // The API returns an array of milestone submissions
                // Each milestone number can have multiple submissions (current + archived)
                if (empty($data)) {
                    $consecutiveEmpty++;
                    $milestoneNum++;

                    continue;
                }

                // Valid milestone(s) found, reset consecutive empty counter
                $consecutiveEmpty = 0;

                // Process each milestone submission (API returns array of submissions)
                if (is_array($data) && ! isset($data['milestone'])) {
                    foreach ($data as $submission) {
                        if (isset($submission['milestone']) && ! empty($submission['title'])) {
                            $results[] = $submission;
                        }
                    }
                } elseif (isset($data['milestone']) && ! empty($data['title'])) {
                    $results[] = $data;
                }

                $milestoneNum++;

                // Small delay between requests (200ms)
                usleep(200000);
            } catch (\Exception $e) {
                logger()->error(
                    "Failed to fetch milestone {$milestoneNum} for api_proposal_id {$api_proposal_id}: "
                    .$e->getMessage()
                );
                $consecutiveEmpty++;
                $milestoneNum++;
            }
        }

        return $results;
    }

    /**
     * Process a single milestone submission and its related data.
     * Each milestone number can have multiple submissions (current + archived/rejected).
     */
    protected function processMilestone(array $milestone, ?string $proposal_id): void
    {
        // Normalize the created_at timestamp to match database format (remove microseconds)
        // API returns: "2025-04-16T20:02:51.123456+00:00" or "2025-04-16 20:02:51"
        // We need: "2025-04-16 20:02:51" for consistent matching
        $createdAt = \Carbon\Carbon::parse($milestone['created_at'])->format('Y-m-d H:i:s');

        // Use project_schedule_id, milestone number, and created_at as unique identifier
        // to distinguish between multiple submissions of the same milestone number
        $savedMilestone = Milestone::updateOrCreate(
            [
                'project_schedule_id' => $this->projectSchedule['project_schedule_id'],
                'milestone' => $milestone['milestone'],
                'created_at' => $createdAt,
            ],
            [
                'title' => $milestone['title'],
                'current' => $milestone['current'],
                'outputs' => $milestone['outputs'],
                'success_criteria' => $milestone['success_criteria'],
                'evidence' => $milestone['evidence'],
                'month' => (int) $milestone['month'],
                'cost' => $milestone['cost'],
                'completion_percent' => $milestone['completion'],
                'created_at' => $createdAt, // Use API's timestamp
                'proposal_id' => $proposal_id,
                'fund_id' => $this->projectSchedule['fund_id'] ?? null,
            ]
        );

        $this->saveSomReviews($milestone['som_reviews'] ?? [], $savedMilestone->id);
        $this->savePoa($milestone['poas'] ?? [], $savedMilestone->id);
    }

    /**
     * Save milestone's 3 review criteria
     */
    protected function saveSomReviews(array $somReviews, string|int $milestoneId): void
    {
        foreach ($somReviews as $somReview) {
            $createdAt = \Carbon\Carbon::parse($somReview['created_at'])->format('Y-m-d H:i:s');

            MilestoneSomReview::updateOrCreate(
                [
                    'milestone_id' => $milestoneId,
                    'user_id' => $somReview['user_id'],
                    'created_at' => $createdAt,
                ],
                [
                    'api_id' => $somReview['id'] ?? null,
                    'outputs_approves' => $somReview['outputs_approves'],
                    'outputs_comment' => $somReview['outputs_comment'],
                    'success_criteria_approves' => $somReview['success_criteria_approves'],
                    'success_criteria_comment' => $somReview['success_criteria_comment'],
                    'evidence_approves' => $somReview['evidence_approves'],
                    'evidence_comment' => $somReview['evidence_comment'],
                    'created_at' => $createdAt, // Use API's timestamp
                    'current' => $somReview['current'],
                    'role' => MilestoneRoleEnum::from($somReview['role'])->role(),
                ]
            );
        }
    }

    /**
     * Save milestone proof of achievement
     */
    protected function savePoa(array $poas, string|int $milestoneId): void
    {
        foreach ($poas as $value) {
            $createdAt = \Carbon\Carbon::parse($value['created_at'])->format('Y-m-d H:i:s');

            $savedPoa = MilestonePoa::updateOrCreate(
                [
                    'milestone_id' => $milestoneId,
                    'created_at' => $createdAt,
                ],
                [
                    'api_id' => $value['id'] ?? null,
                    'content' => $value['content'],
                    'created_at' => $createdAt, // Use API's timestamp
                    'current' => $value['current'],
                ]
            );
            $this->savePoaReviews($value['poas_reviews'], $savedPoa->id);
            $this->savePoaSignOffs($value['signoffs'], $savedPoa->id);
        }
    }

    /**
     * Save milestone proof of achievement reviews
     */
    protected function savePoaReviews(array $reviews, string|int $poaId): void
    {
        foreach ($reviews as $review) {
            $createdAt = \Carbon\Carbon::parse($review['created_at'])->format('Y-m-d H:i:s');

            MilestonePoasReview::updateOrCreate(
                [
                    'milestone_poas_id' => $poaId,
                    'user_id' => $review['user_id'],
                    'created_at' => $createdAt,
                ],
                [
                    'api_id' => $review['id'] ?? null,
                    'content_approved' => $review['content_approved'],
                    'content_comment' => $review['content_comment'],
                    'created_at' => $createdAt, // Use API's timestamp
                    'role' => MilestoneRoleEnum::from($review['role'])->role(),
                    'current' => $review['current'],
                ]
            );
        }
    }

    /**
     * Save milestone proof of achievement signoffs
     */
    protected function savePoaSignOffs(array $signoffs, string|int $poaId): void
    {
        foreach ($signoffs as $signoff) {
            $createdAt = \Carbon\Carbon::parse($signoff['created_at'])->format('Y-m-d H:i:s');

            MilestonePoasSignoff::updateOrCreate(
                [
                    'milestone_poas_id' => $poaId,
                    'user_id' => $signoff['user_id'],
                    'created_at' => $createdAt,
                ],
                [
                    'api_id' => $signoff['id'] ?? null,
                    'created_at' => $createdAt, // Use API's timestamp
                ]
            );
        }
    }
}
