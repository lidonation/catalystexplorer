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
        // PostgreSQL cannot automatically cast bigint to uuid, so we need to:
        // 1. Drop the old column
        // 2. Add a new UUID column with the same name
        DB::statement('ALTER TABLE catalyst_profiles DROP COLUMN claimed_by');
        DB::statement('ALTER TABLE catalyst_profiles ADD COLUMN claimed_by UUID NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to bigint
        DB::statement('ALTER TABLE catalyst_profiles DROP COLUMN claimed_by');
        DB::statement('ALTER TABLE catalyst_profiles ADD COLUMN claimed_by BIGINT NULL');
    }
};
