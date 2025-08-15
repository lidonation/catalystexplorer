<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::table('service_model', function (Blueprint $table) {
            // Drop old columns
            if (Schema::hasColumn('service_model', 'old_service_id')) {
                $table->dropColumn('old_service_id');
            }
            if (Schema::hasColumn('service_model', 'old_model_id')) {
                $table->dropColumn('old_model_id');
            }
            if (Schema::hasColumn('service_model', 'created_at') && Schema::hasColumn('service_model', 'updated_at')) {
                $table->dropTimestamps();
            }
        });

        // Drop old primary key constraint
        DB::statement('ALTER TABLE service_model DROP CONSTRAINT IF EXISTS service_model_pkey CASCADE');

        // Drop old id column
        DB::statement('ALTER TABLE service_model DROP COLUMN IF EXISTS id');

        // Add new UUID id column
        DB::statement('ALTER TABLE service_model ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid()');

        // Add old_user_id column
        DB::statement('ALTER TABLE funds ADD COLUMN old_user_id BIGINT');

        // Copy current numeric IDs
        DB::statement('UPDATE funds SET old_user_id = user_id');

        // Add new UUID column
        DB::statement('ALTER TABLE funds ADD COLUMN new_user_id UUID DEFAULT gen_random_uuid()');
        DB::statement('UPDATE funds SET new_user_id = gen_random_uuid() WHERE new_user_id IS NULL');

        // Drop PK, old column, rename, etc.
        DB::statement('ALTER TABLE funds DROP COLUMN user_id');
        DB::statement('ALTER TABLE funds RENAME COLUMN new_user_id TO user_id');
        DB::statement('ALTER TABLE funds ALTER COLUMN user_id SET NOT NULL');

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_model', function (Blueprint $table) {
            //
        });
    }
};
