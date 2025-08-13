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
        // Add UUID column to groups table
        Schema::table('groups', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
        });

        // Backfill UUIDs for existing records
        DB::table('groups')->whereNull('uuid')->chunkById(100, function ($groups) {
            foreach ($groups as $group) {
                DB::table('groups')
                    ->where('id', $group->id)
                    ->update(['uuid' => (string) Str::uuid()]);
            }
        });

        // Make UUID column non-nullable and add unique index
        Schema::table('groups', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
            $table->unique('uuid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            $table->dropUnique(['uuid']);
            $table->dropColumn('uuid');
        });
    }
};
