<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add UUID column to funds table
        Schema::table('funds', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
        });

        // Backfill UUIDs for existing records
        DB::table('funds')->whereNull('uuid')->chunkById(100, function ($funds) {
            foreach ($funds as $fund) {
                DB::table('funds')
                    ->where('id', $fund->id)
                    ->update(['uuid' => (string) Str::uuid()]);
            }
        });

        // Make UUID column non-nullable and add unique index
        Schema::table('funds', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
            $table->unique('uuid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('funds', function (Blueprint $table) {
            $table->dropUnique(['uuid']);
            $table->dropColumn('uuid');
        });
    }
};
