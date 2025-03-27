<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Community;
use App\Models\Group;
use App\Models\IdeascaleProfile;
use App\Models\MonthlyReport;
use App\Models\ProjectSchedule;
use App\Models\Proposal;
use App\Models\Review;
use App\Models\Transaction;
use Illuminate\Database\Seeder;

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
    }
}
