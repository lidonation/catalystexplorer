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
        // Add UUID column to ideascale_profiles table
        Schema::table('ideascale_profiles', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
        });

        // Backfill UUIDs for existing records
        DB::table('ideascale_profiles')->whereNull('uuid')->chunkById(100, function ($profiles) {
            foreach ($profiles as $profile) {
                DB::table('ideascale_profiles')
                    ->where('id', $profile->id)
                    ->update(['uuid' => (string) Str::uuid()]);
            }
        });

        // Make UUID column non-nullable and add unique index
        Schema::table('ideascale_profiles', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
            $table->unique('uuid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ideascale_profiles', function (Blueprint $table) {
            $table->dropUnique(['uuid']);
            $table->dropColumn('uuid');
        });
    }
};
