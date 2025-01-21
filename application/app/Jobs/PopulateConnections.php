<?php declare(strict_types=1);

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

    private function processProposal(Proposal $proposal): void
    {
        $users = $proposal->users()->get();
        $groups = $proposal->groups()->get();

        $this->establishUserConnections($users);

        $this->establishGroupConnections($groups);

        $this->establishUserGroupConnections($users, $groups);
    }

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

    private function establishUserGroupConnections($users, $groups): void
    {
        foreach ($users as $user) {
            foreach ($groups as $group) {
                $this->createConnection($user, $group);
                $this->createConnection($group, $user);
            }
        }
    }

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
