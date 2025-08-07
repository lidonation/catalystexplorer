<?php

use App\Models\CatalystProfile;
use App\Models\IdeascaleProfile;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Migrate existing ideascale_profile_has_proposal data
        DB::table('ideascale_profile_has_proposal')
            ->orderBy('id')
            ->chunk(1000, function ($rows) {
                $insertData = [];
                foreach ($rows as $row) {
                    $insertData[] = [
                        'proposal_id' => $row->proposal_id,
                        'profile_type' => IdeascaleProfile::class,
                        'profile_id' => $row->ideascale_profile_id,
                    ];
                }
                DB::table('proposal_profiles')->insert($insertData);
            });

        // Migrate existing catalyst_profile_has_proposal data
//        DB::table('catalyst_profile_has_proposal')
//            ->orderBy('id')
//            ->chunk(1000, function ($rows) {
//                $insertData = [];
//                foreach ($rows as $row) {
//                    $insertData[] = [
//                        'proposal_id' => $row->proposal_id,
//                        'profile_type' => CatalystProfile::class,
//                        'profile_id' => $row->catalyst_profile_id,
//                    ];
//                }
//                DB::table('proposal_profiles')->insert($insertData);
//            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clear the polymorphic table
        DB::table('proposal_profiles')->truncate();
    }
};
