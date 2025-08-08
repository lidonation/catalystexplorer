<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            // Add UUID column
            $table->uuid('uuid')->after('id')->nullable()->unique();
        });

        // Populate UUID for existing records
        DB::table('campaigns')->whereNull('uuid')->chunkById(100, function ($campaigns) {
            foreach ($campaigns as $campaign) {
                DB::table('campaigns')
                    ->where('id', $campaign->id)
                    ->update(['uuid' => (string) Str::uuid()]);
            }
        });

        // Make UUID column not nullable
        Schema::table('campaigns', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};
