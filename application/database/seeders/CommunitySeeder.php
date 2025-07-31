<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Community;
use App\Jobs\AttachImageJob;
use Illuminate\Database\Seeder;

class CommunitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $comm = Community::factory()
            ->count(10)
            ->create();


        $comm->each(function (Community $community) {

            AttachImageJob::dispatch($community,  'hero');

            AttachImageJob::dispatch($community,  'banner');
        });
    }
}
