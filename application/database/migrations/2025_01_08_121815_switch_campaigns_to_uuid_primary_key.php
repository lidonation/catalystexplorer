<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the current primary key
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropPrimary(['id']);
        });

        // Rename old id column to legacy_id and make uuid the new primary key
        Schema::table('campaigns', function (Blueprint $table) {
            $table->renameColumn('id', 'legacy_id');
            $table->primary('uuid');
        });

        // Rename uuid to id for cleaner code
        Schema::table('campaigns', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rename id back to uuid
        Schema::table('campaigns', function (Blueprint $table) {
            $table->renameColumn('id', 'uuid');
        });

        // Drop the UUID primary key
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropPrimary(['uuid']);
        });

        // Rename legacy_id back to id and make it primary key
        Schema::table('campaigns', function (Blueprint $table) {
            $table->renameColumn('legacy_id', 'id');
            $table->primary('id');
        });

        // Drop uuid column
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};
