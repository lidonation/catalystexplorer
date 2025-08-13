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
        // PART 1: MIGRATE MODERATORS TABLE
        
        // Step 1: Add new UUID columns to moderators table
        Schema::table('moderators', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->bigInteger('old_id')->nullable()->after('uuid');
            
            // Add indexes for performance
            $table->index('uuid');
        });

        // Step 2: Generate UUIDs for existing moderators and backup old IDs
        DB::statement('UPDATE moderators SET uuid = gen_random_uuid(), old_id = id WHERE id IS NOT NULL');

        // Step 3: Make UUID columns non-nullable
        Schema::table('moderators', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
        });

        // Step 4: Drop existing primary key and create new UUID primary key for moderators
        Schema::table('moderators', function (Blueprint $table) {
            $table->dropPrimary('moderators_pkey');
        });
        
        Schema::table('moderators', function (Blueprint $table) {
            $table->primary('uuid');
        });

        // Step 5: Drop old id column
        Schema::table('moderators', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        // Step 6: Rename UUID column to id
        Schema::table('moderators', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
        });

        // PART 2: MIGRATE MODERATIONS TABLE
        
        // Step 1: Add new UUID columns to moderations table
        Schema::table('moderations', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->bigInteger('old_id')->nullable()->after('uuid');
            $table->uuid('moderator_uuid')->nullable()->after('moderator_id');
            
            // Add indexes for performance
            $table->index('uuid');
            $table->index('moderator_uuid');
        });

        // Step 2: Generate UUIDs for existing moderations and backup old IDs
        DB::statement('UPDATE moderations SET uuid = gen_random_uuid(), old_id = id WHERE id IS NOT NULL');

        // Step 3: Convert moderator_id references from old bigint to UUIDs (if any exist)
        $moderationsWithModerator = DB::scalar('SELECT COUNT(*) FROM moderations WHERE moderator_id IS NOT NULL');
        if ($moderationsWithModerator > 0) {
            DB::statement("
                UPDATE moderations 
                SET moderator_uuid = moderators.id
                FROM moderators 
                WHERE moderations.moderator_id = moderators.old_id
                  AND moderations.moderator_id IS NOT NULL
            ");
        }

        // Step 4: Make UUID columns non-nullable
        Schema::table('moderations', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
        });

        // Note: Keep moderator_uuid nullable as most moderations don't have moderators

        // Step 5: Drop existing primary key and create new UUID primary key for moderations
        Schema::table('moderations', function (Blueprint $table) {
            $table->dropPrimary('moderations_pkey');
        });
        
        Schema::table('moderations', function (Blueprint $table) {
            $table->primary('uuid');
        });

        // Step 6: Drop old columns
        Schema::table('moderations', function (Blueprint $table) {
            $table->dropColumn(['id', 'moderator_id']);
        });

        // Step 7: Rename columns to final names
        Schema::table('moderations', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
            $table->renameColumn('moderator_uuid', 'moderator_id');
        });

        // PART 3: MIGRATE MONTHLY_REPORTS TABLE
        
        // Step 1: Add new UUID columns to monthly_reports table
        Schema::table('monthly_reports', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->bigInteger('old_id')->nullable()->after('uuid');
            
            // Add indexes for performance
            $table->index('uuid');
        });

        // Step 2: Generate UUIDs for existing monthly_reports and backup old IDs (if any exist)
        $monthlyReportsCount = DB::scalar('SELECT COUNT(*) FROM monthly_reports');
        if ($monthlyReportsCount > 0) {
            DB::statement('UPDATE monthly_reports SET uuid = gen_random_uuid(), old_id = id WHERE id IS NOT NULL');
            
            Schema::table('monthly_reports', function (Blueprint $table) {
                $table->uuid('uuid')->nullable(false)->change();
            });
        }

        // Step 3: Drop existing primary key and create new UUID primary key for monthly_reports
        Schema::table('monthly_reports', function (Blueprint $table) {
            $table->dropPrimary('monthly_reports_pkey');
        });
        
        Schema::table('monthly_reports', function (Blueprint $table) {
            $table->primary('uuid');
        });

        // Step 4: Drop old id column
        Schema::table('monthly_reports', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        // Step 5: Rename UUID column to id
        Schema::table('monthly_reports', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
        });

        // Step 6: Update indexes for renamed columns
        DB::statement('DROP INDEX IF EXISTS moderators_uuid_index');
        DB::statement('DROP INDEX IF EXISTS moderations_uuid_index');
        DB::statement('DROP INDEX IF EXISTS moderations_moderator_uuid_index');
        DB::statement('DROP INDEX IF EXISTS monthly_reports_uuid_index');

        DB::statement('CREATE INDEX moderators_id_index ON moderators (id)');
        DB::statement('CREATE INDEX moderations_id_index ON moderations (id)');
        DB::statement('CREATE INDEX moderations_moderator_id_index ON moderations (moderator_id)');
        DB::statement('CREATE INDEX monthly_reports_id_index ON monthly_reports (id)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a complex rollback - implement if needed
        throw new Exception('Migration rollback not implemented due to complexity. Use database backup if rollback needed.');
    }
};
