<?php

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
        // Clean up any remaining NULL values first
        DB::table('group_has_proposal')
            ->whereNull('group_id')
            ->orWhereNull('proposal_id')
            ->delete();
            
        // Add NOT NULL constraints
        Schema::table('group_has_proposal', function (Blueprint $table) {
            $table->uuid('group_id')->nullable(false)->change();
            $table->uuid('proposal_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('group_has_proposal', function (Blueprint $table) {
            $table->uuid('group_id')->nullable()->change();
            $table->uuid('proposal_id')->nullable()->change();
        });
    }
};
