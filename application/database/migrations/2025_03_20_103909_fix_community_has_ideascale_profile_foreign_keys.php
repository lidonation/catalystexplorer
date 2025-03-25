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
        Schema::table('community_has_ideascale_profile', function (Blueprint $table) {

            $table->dropForeign(['community_id']);
            $table->foreign('community_id')->references('id')->on('communities')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('community_has_ideascale_profile', function (Blueprint $table) {

            $table->dropForeign(['community_id']);
            $table->foreign('community_id')->references('id')->on('groups')->onDelete('cascade');
        });
    }
};
