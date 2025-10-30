<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('voting_powers', function (Blueprint $table) {
            // Add a unique constraint on the combination of voter_id and snapshot_id
            $table->unique(['voter_id', 'snapshot_id'], 'voting_powers_voter_snapshot_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voting_powers', function (Blueprint $table) {
            $table->dropUnique('voting_powers_voter_snapshot_unique');
        });
    }
};
