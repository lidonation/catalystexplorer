<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add new UUID-based campaign_uuid column
        Schema::table('proposals', function (Blueprint $table) {
            $table->uuid('campaign_uuid')->after('campaign_id')->nullable()->index();
        });

        // Populate campaign_uuid from campaigns.uuid based on campaign_id
        DB::table('proposals')
            ->join('campaigns', 'proposals.campaign_id', '=', 'campaigns.id')
            ->whereNotNull('proposals.campaign_id')
            ->select('proposals.id as proposal_id', 'campaigns.uuid as campaign_uuid')
            ->orderBy('proposals.id')
            ->chunk(1000, function ($proposals) {
                foreach ($proposals as $proposal) {
                    DB::table('proposals')
                        ->where('id', $proposal->proposal_id)
                        ->update(['campaign_uuid' => $proposal->campaign_uuid]);
                }
            });

        // Drop old campaign_id column and rename campaign_uuid to campaign_id
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropColumn('campaign_id');
        });

        Schema::table('proposals', function (Blueprint $table) {
            $table->renameColumn('campaign_uuid', 'campaign_id');
        });

        // Note: Foreign key constraint will be added after campaigns table is fully migrated to UUID
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove foreign key constraint
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropForeign(['campaign_id']);
        });

        // Add back the old integer campaign_id column
        Schema::table('proposals', function (Blueprint $table) {
            $table->renameColumn('campaign_id', 'campaign_uuid');
        });

        Schema::table('proposals', function (Blueprint $table) {
            $table->bigInteger('campaign_id')->after('campaign_uuid')->nullable();
        });

        // Repopulate integer campaign_id from campaigns.id based on campaign_uuid
        DB::table('proposals')
            ->join('campaigns', 'proposals.campaign_uuid', '=', 'campaigns.uuid')
            ->whereNotNull('proposals.campaign_uuid')
            ->select('proposals.id as proposal_id', 'campaigns.legacy_id as campaign_legacy_id')
            ->orderBy('proposals.id')
            ->chunk(1000, function ($proposals) {
                foreach ($proposals as $proposal) {
                    DB::table('proposals')
                        ->where('id', $proposal->proposal_id)
                        ->update(['campaign_id' => $proposal->campaign_legacy_id]);
                }
            });

        // Drop the UUID column
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropColumn('campaign_uuid');
        });
    }
};
