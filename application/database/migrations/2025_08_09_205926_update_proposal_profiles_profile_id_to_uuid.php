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
        // Only attempt to cast to UUID if:
        // 1) The table exists, and
        // 2) Every non-null profile_id is already a valid UUID string.
        if (!Schema::hasTable('proposal_profiles')) {
            return;
        }

        // Count rows that are NOT valid UUIDs (case-insensitive) in canonical 8-4-4-4-12 form
        // Postgres regex operator ~* is case-insensitive. Double quotes are escaped in PHP string.
        $invalidCount = DB::table('proposal_profiles')
            ->whereRaw("profile_id IS NOT NULL AND profile_id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'")
            ->count();

        if ($invalidCount === 0) {
            DB::statement('ALTER TABLE proposal_profiles ALTER COLUMN profile_id TYPE uuid USING profile_id::uuid');
        } else {
            // Leave column as string to support mixed integer/uuid ids.
            // If you plan to migrate integers to UUIDs, run that data migration first and then re-run this.
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to VARCHAR if needed
        if (Schema::hasTable('proposal_profiles')) {
            Schema::table('proposal_profiles', function (Blueprint $table) {
                // If the column is already uuid, this will convert it back to string; if not, no harm in reasserting string type
                $table->string('profile_id')->change();
            });
        }
    }
};
