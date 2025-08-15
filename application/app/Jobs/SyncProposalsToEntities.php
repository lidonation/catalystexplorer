<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Community;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Models\Proposal;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncProposalsToEntities implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct() {}

    public function handle(): void
    {
        $groups = Group::all();
        $communities = Community::all();
        $profiles = IdeascaleProfile::all();
        
        $profiles->each(function ($profile) {
            $proposal = Proposal::inRandomOrder()->first();
            if ($proposal) {
                $proposal->users()->syncWithoutDetaching($profile->id);
            } else {
                Log::warning('SyncProposalsToEntities: No proposal found for profile sync');
            }
        });

        $groups->each(function ($group) {
            $proposal = Proposal::inRandomOrder()->first();
            if ($proposal) {
                $proposal->groups()->syncWithoutDetaching($group->id);
            } else {
                Log::warning('SyncProposalsToEntities: No proposal found for group sync');
            }
        });

        $communities->each(function ($community) {
            $proposal = Proposal::inRandomOrder()->first();
            if ($proposal) {
                $proposal->communities()->syncWithoutDetaching($community->id);
            } else {
                Log::warning('SyncProposalsToEntities: No proposal found for community sync');
            }
        });
    }
}