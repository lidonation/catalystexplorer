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
        Schema::table('reviewers', function (Blueprint $table) {
            $table->index('catalyst_reviewer_id');
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviewers', function (Blueprint $table) {
            $table->dropIndex(['catalyst_reviewer_id']);
        });
    }
};
