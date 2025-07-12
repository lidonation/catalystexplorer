<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Group;
use App\Jobs\AttachImageJob;
use Illuminate\Database\Seeder;
use Database\Seeders\Traits\GetImageLink;

class GroupSeeder extends Seeder
{
    use GetImageLink;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $groups = Group::factory()->count(30)->create();

        $groups->each(function (Group $group) {

            AttachImageJob::dispatch($group,  'hero');

            AttachImageJob::dispatch($group,  'banner');
        });
    }
}
