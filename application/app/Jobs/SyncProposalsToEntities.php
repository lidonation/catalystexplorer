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

class SyncProposalsToEntities implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct() {}

    public function handle(): void
    {
        $groups = Group::all();
        $communities = Community::all();
        $profiles = IdeascaleProfile::all();

        $profiles->each(
            fn ($profile) => Proposal::inRandomOrder()->first()->users()->syncWithoutDetaching($profile->getOriginal('id'))
        );

        $groups->each(
            fn ($group) => Proposal::inRandomOrder()->first()->groups()->syncWithoutDetaching($group->getOriginal('id'))
        );

        $communities->each(
            fn ($community) => Proposal::inRandomOrder()->first()->communities()->syncWithoutDetaching($community->getOriginal('id'))
        );
    }
}
