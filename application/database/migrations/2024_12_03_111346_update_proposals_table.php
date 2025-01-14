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
        Schema::table('proposals', function (Blueprint $table) {
            $table->integer('project_length')->nullable();
            $table->string('projectcatalyst_io_url')->nullable();
            $table->bigInteger('iog_hash')->nullable();
            $table->bigInteger('vote_casts')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropColumn('project_length');
            $table->dropColumn('vote_casts');
            $table->dropColumn('projectcatalyst_io_url');
            $table->dropColumn('vote_cast');
        });
    }
};
