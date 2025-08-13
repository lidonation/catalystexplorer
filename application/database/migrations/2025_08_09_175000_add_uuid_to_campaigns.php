<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Add UUID column to campaigns table
        Schema::table('campaigns', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
        });

        // Step 2: Backfill UUIDs for existing campaigns
        // Get all campaigns that don't have UUIDs yet
        $campaigns = DB::table('campaigns')->whereNull('uuid')->get(['id']);
        
        foreach ($campaigns as $campaign) {
            DB::table('campaigns')
                ->where('id', $campaign->id)
                ->update(['uuid' => Str::uuid()]);
        }

        // Step 3: Make UUID column non-nullable and unique
        Schema::table('campaigns', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
            $table->unique('uuid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropUnique(['uuid']);
            $table->dropColumn('uuid');
        });
    }
};
