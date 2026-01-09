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
        if (Schema::hasTable('proposals') && Schema::hasColumn('proposals', 'projectcatalyst_io_url')) {
            Schema::table('proposals', function (Blueprint $table) {
                $table->renameColumn('projectcatalyst_io_url', 'projectcatalyst_io_link');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('proposals') && Schema::hasColumn('proposals', 'projectcatalyst_io_link')) {
            Schema::table('proposals', function (Blueprint $table) {
                $table->renameColumn('projectcatalyst_io_link', 'projectcatalyst_io_url');
            });
        }
    }
};
