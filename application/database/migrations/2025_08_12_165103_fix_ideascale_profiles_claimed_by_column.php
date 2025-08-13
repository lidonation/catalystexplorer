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
        Schema::table('ideascale_profiles', function (Blueprint $table) {
            // Drop the old bigint claimed_by_id column since data has been migrated to claimed_by_uuid
            $table->dropColumn('claimed_by_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ideascale_profiles', function (Blueprint $table) {
            // Re-add the claimed_by_id column
            $table->unsignedBigInteger('claimed_by_id')->nullable()->after('ideascale');
        });
    }
};
