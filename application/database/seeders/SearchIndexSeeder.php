<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\BookmarkCollection;
use App\Models\Group;
use App\Models\Link;
use App\Models\Voter;
use App\Models\Review;
use App\Models\Proposal;
use App\Models\Community;
use App\Models\Transaction;
use App\Models\VoterHistory;
use App\Models\MonthlyReport;
use App\Models\ProjectSchedule;
use Illuminate\Database\Seeder;
use App\Models\IdeascaleProfile;

class SearchIndexSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Proposal::runCustomIndex();
        IdeascaleProfile::runCustomIndex();
        Review::runCustomIndex();
        Group::runCustomIndex();
        Community::runCustomIndex();
        MonthlyReport::runCustomIndex();
        Transaction::runCustomIndex();
        ProjectSchedule::runCustomIndex();
        VoterHistory::runCustomIndex();
        Voter::runCustomIndex();
        BookmarkCollection::runCustomIndex();
        Link::runCustomIndex();
    }
}
