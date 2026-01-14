<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Connection;
use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class PopulateConnections implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(protected Proposal $proposal) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->processProposal($this->proposal);
    }

    /**
     * Process the given proposal by creating connections between users, groups,
     * and user-group combinations associated with the proposal.
     *
     * @param  Proposal  $proposal  The proposal being processed.
     */
    private function processProposal(Proposal $proposal): void
    {
        $ideascaleProfiles = $proposal->ideascale_profiles()->get();

        $catalystProfiles = $proposal->catalyst_profiles()->get();

        $allProfiles = $ideascaleProfiles->merge($catalystProfiles);

        $groups = $proposal->groups()->get();

        $groups = $proposal->groups()->get();

        $this->establishProfileConnections($allProfiles);

        $this->establishGroupConnections($groups);

        $this->establishProfileGroupConnections($allProfiles, $groups);
    }

    private function establishProfileConnections($profiles): void
    {
        foreach ($profiles as $profileA) {
            foreach ($profiles as $profileB) {
                if ($profileA->id !== $profileB->id || get_class($profileA) !== get_class($profileB)) {
                    $this->createConnection($profileA, $profileB);
                }
            }
        }
    }

    /**
     * Establish connections between all groups.
     * - Iterate over all groups in pairs.
     * - Skip creating a connection if the group IDs are the same.
     * - For valid pairs, create a connection between them if one does not already exist.
     *
     * @param  \Illuminate\Support\Collection  $groups  The collection of groups.
     */
    private function establishGroupConnections($groups): void
    {
        foreach ($groups as $groupA) {
            foreach ($groups as $groupB) {
                if ($groupA->id !== $groupB->id) {
                    $this->createConnection($groupA, $groupB);
                }
            }
        }
    }

    private function establishProfileGroupConnections($profiles, $groups): void
    {
        foreach ($profiles as $profile) {
            foreach ($groups as $group) {
                $this->createConnection($profile, $group);
                $this->createConnection($group, $profile);
            }
        }
    }

    private function createConnection($modelA, $modelB): void
    {
        $modelAType = get_class($modelA);
        $modelBType = get_class($modelB);
        $modelAId = (string) $modelA->id;
        $modelBId = (string) $modelB->id;

        // Check if forward connection exists
        $existingForward = Connection::where([
            'previous_model_type' => $modelAType,
            'previous_model_id' => $modelAId,
            'next_model_type' => $modelBType,
            'next_model_id' => $modelBId,
        ])->exists();

        if (! $existingForward) {
            Connection::create([
                'previous_model_type' => $modelAType,
                'previous_model_id' => $modelAId,
                'next_model_type' => $modelBType,
                'next_model_id' => $modelBId,
            ]);
        }

        // Check if backward connection exists
        $existingBackward = Connection::where([
            'previous_model_type' => $modelBType,
            'previous_model_id' => $modelBId,
            'next_model_type' => $modelAType,
            'next_model_id' => $modelAId,
        ])->exists();

        if (! $existingBackward) {
            Connection::create([
                'previous_model_type' => $modelBType,
                'previous_model_id' => $modelBId,
                'next_model_type' => $modelAType,
                'next_model_id' => $modelAId,
            ]);
        }
    }
}
