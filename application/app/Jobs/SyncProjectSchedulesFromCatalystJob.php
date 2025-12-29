<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\MilestoneStatusEnum;
use App\Models\Fund;
use App\Models\Meta;
use App\Models\ProjectSchedule;
use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use JetBrains\PhpStorm\NoReturn;

class SyncProjectSchedulesFromCatalystJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(
        protected array $projectSchedule,
        protected bool $syncMode = false
    ) {}

    /**
     * Execute the job.
     *
     * @throws \Exception
     */
    #[NoReturn]
    public function handle(): void
    {
        $savedProjectSchedule = $this->saveCatalystProjectSchedule();

        if ($this->syncMode) {
            $milestoneJob = new SyncCatalystMilestoneJob($savedProjectSchedule);
            $milestoneJob->handle();
        } else {
            SyncCatalystMilestoneJob::dispatch($savedProjectSchedule);
        }
    }

    /**
     * Save or update parent milestone
     *
     * @throws \Exception
     */
    protected function saveCatalystProjectSchedule(): array
    {
        $existingProposalMilestone = ProjectSchedule::where('title', $this->projectSchedule['title'])->first();

        $proposalTitle = preg_replace('/[^a-z0-9]/i', '', strtolower($this->projectSchedule['title']));

        $relatedProposal = Proposal::whereRaw("regexp_replace(LOWER(title->>'en'), '[^a-z0-9]', '', 'g') ILIKE ?", ["%{$proposalTitle}%"])
            ->first();

        if (empty($relatedProposal)) {
            $relatedProposal = $this->findProposalByProjectId($this->projectSchedule['project_id']);
        }

        if ($relatedProposal) {
            return $this->saveUpdateProjectSchedule($existingProposalMilestone, $relatedProposal);
        } else {
            throw new \Exception("Proposal {$proposalTitle} not found");
        }
    }

    public function findProposalByProjectId(int $projectId): ?Proposal
    {
        $metaModelId = Meta::where('key', 'iog_hash')
            ->where('content', $projectId)
            ->first()?->model_id;

        return $metaModelId ? Proposal::find($metaModelId) : null;
    }

    /**
     * Save or update parent milestone
     */
    protected function saveUpdateProjectSchedule(?ProjectSchedule $projectSchedule, Proposal $proposal): array
    {
        $projectScheduleData = [];

        foreach ($this->projectSchedule as $key => $value) {
            if ($key == 'status') {
                // Handle both integer (from API) and string (already converted) status values
                if (is_int($value)) {
                    try {
                        $projectScheduleData['status'] = MilestoneStatusEnum::from($value)->status();
                    } catch (\ValueError $e) {
                        $projectScheduleData['status'] = 'active';
                    }
                } else {
                    $validStatuses = array_map(
                        fn ($case) => $case->status(),
                        MilestoneStatusEnum::cases()
                    );

                    if (in_array($value, $validStatuses)) {
                        $projectScheduleData['status'] = $value;
                    } else {
                        $projectScheduleData['status'] = MilestoneStatusEnum::ZERO->status();
                    }
                }
            } elseif ($key == 'milestones_qty' || $key == 'milestones_count') {
                $projectScheduleData['milestone_count'] = $value;
            } elseif ($key !== 'project_schedule_id') {
                // Skip project_schedule_id as it's not a database column
                $projectScheduleData[$key] = $value;
            }
        }

        $projectScheduleData['proposal_id'] = $proposal->id;

        // Heuristically determine fund_id if not already set
        if (! isset($projectScheduleData['fund_id']) && isset($projectScheduleData['project_id'])) {
            $projectScheduleData['fund_id'] = $this->determineFundId($projectScheduleData['project_id']);
        }

        // Remove the API's 'id' field before saving and preserve it as api_proposal_id
        $apiProposalId = $projectScheduleData['id'] ?? null;
        unset($projectScheduleData['id']);

        // Store the API's proposal ID for milestone fetching
        if ($apiProposalId) {
            $projectScheduleData['api_proposal_id'] = $apiProposalId;
        }

        if ($projectSchedule) {
            $projectSchedule->update($projectScheduleData);
            $savedProjectSchedule = $projectSchedule;
        } else {
            $savedProjectSchedule = ProjectSchedule::create($projectScheduleData);
        }

        // Update the related proposal's status based on project schedule status
        $this->updateRelatedProposal($proposal, $projectScheduleData['status'], $projectScheduleData['funds_distributed'] ?? null);

        // Add the database ID and API proposal ID to return array for downstream job
        $projectScheduleData['project_schedule_id'] = $savedProjectSchedule->id;
        $projectScheduleData['api_proposal_id'] = $apiProposalId;

        return $projectScheduleData;
    }

    /**
     * Heuristically determine fund_id from project_id.
     * Extracts the first integer from project_id (e.g., 900009 -> 9)
     * and finds the fund by slug (e.g., "fund-9").
     */
    protected function determineFundId(int $projectId): ?string
    {
        $fundNumber = $this->extractFundNumber($projectId);

        if ($fundNumber === null) {
            return null;
        }

        $fund = Fund::where('slug', "fund-{$fundNumber}")->first();

        return $fund?->id;
    }

    /**
     * Extract fund number from project_id.
     * E.g., 900009 -> 9, 1000123 -> 10
     */
    protected function extractFundNumber(int $projectId): ?int
    {
        $projectIdStr = (string) $projectId;

        // Match the first sequence of digits
        if (preg_match('/^(\d+)/', $projectIdStr, $matches)) {
            $firstNumber = (int) $matches[1];

            // For project IDs like 900009, we want the first significant digit(s)
            // Typically, the pattern is: [fund_number][zeros][sequence]
            // So we need to extract the leading non-zero digit(s)
            if ($firstNumber > 0) {
                // Get the first 1-2 digits (to handle fund numbers like 9, 10, 11, etc.)
                if ($projectIdStr[0] === '9' && strlen($projectIdStr) >= 6) {
                    // Single digit fund (e.g., 900009 -> 9)
                    return 9;
                } elseif ($projectIdStr[0] === '1' && strlen($projectIdStr) >= 6) {
                    // Check if it's fund 10+ (e.g., 1000123 -> 10, 1100456 -> 11)
                    $firstTwoDigits = (int) substr($projectIdStr, 0, 2);
                    if ($firstTwoDigits >= 10 && $firstTwoDigits <= 99) {
                        return $firstTwoDigits;
                    }

                    return 1;
                }

                // For other cases, return the first digit
                return (int) $projectIdStr[0];
            }
        }

        return null;
    }

    /**
     * Update the proposal status based on the project schedule status
     */
    protected function updateRelatedProposal(Proposal $proposal, string $scheduleStatus, ?float $fundsDistributed): void
    {
        // Map project schedule status to proposal status
        $proposalStatus = match ($scheduleStatus) {
            'active' => 'in_progress',
            'paused' => 'paused',
            'terminated' => 'terminated',
            'completed' => 'complete',
            default => 'in_progress',
        };

        $updateData = [
            'status' => $proposalStatus,
            'updated_at' => now(),
        ];

        if ($fundsDistributed !== null) {
            $updateData['amount_received'] = $fundsDistributed;
            $updateData['funding_updated_at'] = now();
        }

        $proposal->update($updateData);
    }
}
