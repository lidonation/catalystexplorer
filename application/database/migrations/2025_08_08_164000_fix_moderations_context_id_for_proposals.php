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
        // Add temporary UUID column
        Schema::table('moderations', function (Blueprint $table) {
            $table->string('context_uuid_temp')->nullable();
        });

        // Update proposal references in moderations table
        DB::statement("
            UPDATE moderations 
            SET context_uuid_temp = proposals.id 
            FROM proposals 
            WHERE proposals.legacy_id = moderations.context_id::bigint 
            AND moderations.context_type = 'App\\Models\\Proposal'
        ");

        echo "Updated proposal references in moderations table\n";

        // For non-proposal context_ids, copy the existing value as string
        DB::statement("
            UPDATE moderations 
            SET context_uuid_temp = context_id::varchar 
            WHERE context_type != 'App\\Models\\Proposal' 
            AND context_uuid_temp IS NULL
        ");

        echo "Updated non-proposal references in moderations table\n";

        // Drop the old context_id column and rename temp column
        Schema::table('moderations', function (Blueprint $table) {
            $table->dropColumn('context_id');
        });

        Schema::table('moderations', function (Blueprint $table) {
            $table->renameColumn('context_uuid_temp', 'context_id');
        });

        echo "Successfully converted context_id column to varchar in moderations table\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration should not be reversed as it fixes critical data integrity issues
    }
};
