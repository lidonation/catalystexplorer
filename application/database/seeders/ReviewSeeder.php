<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Review;
use App\Models\Proposal;
use App\Models\Discussion;
use Illuminate\Database\Seeder;
use App\Models\ReviewModeration;
use App\Jobs\SeedProposalReviewsJob;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        Proposal::select('id')->chunk(100, function ($proposals) {
            $proposalIds = $proposals->pluck('id')->toArray();
            SeedProposalReviewsJob::dispatch($proposalIds);
        });
    }
}
