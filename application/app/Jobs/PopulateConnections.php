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
use Illuminate\Support\Facades\Log;

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
        Log::info('Processing proposal with ID: '.$this->proposal->id);
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
        $users = $proposal->users()->get();
        $groups = $proposal->groups()->get();

        $this->establishUserConnections($users);

        $this->establishGroupConnections($groups);

        $this->establishUserGroupConnections($users, $groups);
    }

    /**
     * Establish connections between all users.
     * - Iterate over all users in pairs.
     * - Skip creating a connection if the user IDs are the same.
     * - For valid pairs, create a connection between them if one does not already exist.
     *
     * @param  \Illuminate\Support\Collection  $users  The collection of users.
     */
    private function establishUserConnections($users): void
    {
        foreach ($users as $userA) {
            foreach ($users as $userB) {
                if ($userA->id !== $userB->id) {
                    $this->createConnection($userA, $userB);
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

    /**
     * Establish connections between all users and all groups.
     * - Iterate over every user and group combination.
     * - Create a connection from the user to the group and vice versa if none exist.
     *
     * @param  \Illuminate\Support\Collection  $users  The collection of users.
     * @param  \Illuminate\Support\Collection  $groups  The collection of groups.
     */
    private function establishUserGroupConnections($users, $groups): void
    {
        foreach ($users as $user) {
            foreach ($groups as $group) {
                $this->createConnection($user, $group);
                $this->createConnection($group, $user);
            }
        }
    }

    /**
     * Create a connection between two models (user/group).
     * - Determine the class and ID of the models being connected.
     * - Check if a forward connection already exists (modelA -> modelB).
     * - If not, create the forward connection.
     * - Check if a backward connection already exists (modelB -> modelA).
     * - If not, create the backward connection.
     *
     * @param  mixed  $modelA  The first model in the connection (user or group).
     * @param  mixed  $modelB  The second model in the connection (user or group).
     */
    private function createConnection($modelA, $modelB): void
    {
        $modelAType = get_class($modelA);
        $modelBType = get_class($modelB);

        $existingForwardConnection = Connection::where([
            'previous_model_type' => $modelAType,
            'previous_model_id' => $modelA->id,
            'next_model_type' => $modelBType,
            'next_model_id' => $modelB->id,
        ])->exists();

        if (! $existingForwardConnection) {
            Connection::create([
                'previous_model_type' => $modelAType,
                'previous_model_id' => $modelA->id,
                'next_model_type' => $modelBType,
                'next_model_id' => $modelB->id,
            ]);
        }

        $existingBackwardsConnection = Connection::where([
            'previous_model_type' => $modelBType,
            'previous_model_id' => $modelB->id,
            'next_model_type' => $modelAType,
            'next_model_id' => $modelA->id,
        ])->exists();

        if (! $existingBackwardsConnection) {
            Connection::create([
                'previous_model_type' => $modelBType,
                'previous_model_id' => $modelB->id,
                'next_model_type' => $modelAType,
                'next_model_id' => $modelA->id,
            ]);
        }
    }
}
