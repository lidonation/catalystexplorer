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
        Schema::table('catalyst_profiles', function (Blueprint $table) {
            $table->dropColumn('claimed_by');
        });

        Schema::table('ideascale_profiles', function (Blueprint $table) {
            $table->dropColumn('claimed_by_uuid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('catalyst_profiles', function (Blueprint $table) {
            $table->uuid('claimed_by')->nullable();
        });

        Schema::table('ideascale_profiles', function (Blueprint $table) {
            $table->uuid('claimed_by_uuid')->nullable();
        });
    }
};
