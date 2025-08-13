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
        // Step 1: Add new UUID columns to reviewers table
        Schema::table('reviewers', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->bigInteger('old_id')->nullable()->after('uuid');
            
            // Add indexes for performance
            $table->index('uuid');
        });

        // Step 2: Generate UUIDs for existing reviewers and backup old IDs
        DB::statement('UPDATE reviewers SET uuid = gen_random_uuid(), old_id = id');

        // Step 3: Update related tables to reference reviewer UUIDs
        
        // Update reviews table
        Schema::table('reviews', function (Blueprint $table) {
            $table->uuid('reviewer_uuid')->nullable()->after('reviewer_id');
            $table->index('reviewer_uuid');
        });

        DB::statement("
            UPDATE reviews 
            SET reviewer_uuid = reviewers.uuid
            FROM reviewers 
            WHERE reviews.reviewer_id = reviewers.old_id
              AND reviews.reviewer_id IS NOT NULL
        ");

        // Update moderations table
        Schema::table('moderations', function (Blueprint $table) {
            $table->uuid('reviewer_uuid')->nullable()->after('reviewer_id');
            $table->index('reviewer_uuid');
        });

        DB::statement("
            UPDATE moderations 
            SET reviewer_uuid = reviewers.uuid
            FROM reviewers 
            WHERE moderations.reviewer_id = reviewers.old_id
        ");

        // Update reviewer_reputation_scores table
        Schema::table('reviewer_reputation_scores', function (Blueprint $table) {
            $table->uuid('reviewer_uuid')->nullable()->after('reviewer_id');
            $table->index('reviewer_uuid');
        });

        DB::statement("
            UPDATE reviewer_reputation_scores 
            SET reviewer_uuid = reviewers.uuid
            FROM reviewers 
            WHERE reviewer_reputation_scores.reviewer_id = reviewers.old_id
        ");

        // Update review_moderation_reviewers table (if it has data)
        $reviewModReviewers = DB::scalar('SELECT COUNT(*) FROM review_moderation_reviewers');
        if ($reviewModReviewers > 0) {
            Schema::table('review_moderation_reviewers', function (Blueprint $table) {
                $table->uuid('reviewer_uuid')->nullable()->after('reviewer_id');
                $table->index('reviewer_uuid');
            });

            DB::statement("
                UPDATE review_moderation_reviewers 
                SET reviewer_uuid = reviewers.uuid
                FROM reviewers 
                WHERE review_moderation_reviewers.reviewer_id = reviewers.old_id
            ");
        }

        // Update review_moderations table (if it has data)
        $reviewModerations = DB::scalar('SELECT COUNT(*) FROM review_moderations');
        if ($reviewModerations > 0) {
            Schema::table('review_moderations', function (Blueprint $table) {
                $table->uuid('reviewer_uuid')->nullable()->after('reviewer_id');
                $table->index('reviewer_uuid');
            });

            DB::statement("
                UPDATE review_moderations 
                SET reviewer_uuid = reviewers.uuid
                FROM reviewers 
                WHERE review_moderations.reviewer_id = reviewers.old_id
            ");
        }

        // Step 4: Make UUID columns non-nullable
        Schema::table('reviewers', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
        });

        // Note: Keep reviewer_uuid nullable as some reviews don't have reviewers
        // Schema::table('reviews', function (Blueprint $table) {
        //     $table->uuid('reviewer_uuid')->nullable(false)->change();
        // });

        Schema::table('moderations', function (Blueprint $table) {
            $table->uuid('reviewer_uuid')->nullable(false)->change();
        });

        Schema::table('reviewer_reputation_scores', function (Blueprint $table) {
            $table->uuid('reviewer_uuid')->nullable(false)->change();
        });

        if ($reviewModReviewers > 0) {
            Schema::table('review_moderation_reviewers', function (Blueprint $table) {
                $table->uuid('reviewer_uuid')->nullable(false)->change();
            });
        }

        if ($reviewModerations > 0) {
            Schema::table('review_moderations', function (Blueprint $table) {
                $table->uuid('reviewer_uuid')->nullable(false)->change();
            });
        }

        // Step 5: Drop existing primary key and create new UUID primary key for reviewers
        Schema::table('reviewers', function (Blueprint $table) {
            $table->dropPrimary('reviewers_pkey');
        });
        
        Schema::table('reviewers', function (Blueprint $table) {
            $table->primary('uuid');
        });

        // Step 6: Drop old columns
        Schema::table('reviewers', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn('reviewer_id');
        });

        Schema::table('moderations', function (Blueprint $table) {
            $table->dropColumn('reviewer_id');
        });

        Schema::table('reviewer_reputation_scores', function (Blueprint $table) {
            $table->dropColumn('reviewer_id');
        });

        if ($reviewModReviewers > 0) {
            Schema::table('review_moderation_reviewers', function (Blueprint $table) {
                $table->dropColumn('reviewer_id');
            });
        }

        if ($reviewModerations > 0) {
            Schema::table('review_moderations', function (Blueprint $table) {
                $table->dropColumn('reviewer_id');
            });
        }

        // Step 7: Rename columns to final names
        Schema::table('reviewers', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->renameColumn('reviewer_uuid', 'reviewer_id');
        });

        Schema::table('moderations', function (Blueprint $table) {
            $table->renameColumn('reviewer_uuid', 'reviewer_id');
        });

        Schema::table('reviewer_reputation_scores', function (Blueprint $table) {
            $table->renameColumn('reviewer_uuid', 'reviewer_id');
        });

        if ($reviewModReviewers > 0) {
            Schema::table('review_moderation_reviewers', function (Blueprint $table) {
                $table->renameColumn('reviewer_uuid', 'reviewer_id');
            });
        }

        if ($reviewModerations > 0) {
            Schema::table('review_moderations', function (Blueprint $table) {
                $table->renameColumn('reviewer_uuid', 'reviewer_id');
            });
        }

        // Step 8: Update indexes for renamed columns
        DB::statement('DROP INDEX IF EXISTS reviewers_uuid_index');
        DB::statement('DROP INDEX IF EXISTS reviews_reviewer_uuid_index');
        DB::statement('DROP INDEX IF EXISTS moderations_reviewer_uuid_index');
        DB::statement('DROP INDEX IF EXISTS reviewer_reputation_scores_reviewer_uuid_index');

        DB::statement('CREATE INDEX reviewers_id_index ON reviewers (id)');
        DB::statement('CREATE INDEX reviews_reviewer_id_index ON reviews (reviewer_id)');
        DB::statement('CREATE INDEX moderations_reviewer_id_index ON moderations (reviewer_id)');
        DB::statement('CREATE INDEX reviewer_reputation_scores_reviewer_id_index ON reviewer_reputation_scores (reviewer_id)');

        if ($reviewModReviewers > 0) {
            DB::statement('DROP INDEX IF EXISTS review_moderation_reviewers_reviewer_uuid_index');
            DB::statement('CREATE INDEX review_moderation_reviewers_reviewer_id_index ON review_moderation_reviewers (reviewer_id)');
        }

        if ($reviewModerations > 0) {
            DB::statement('DROP INDEX IF EXISTS review_moderations_reviewer_uuid_index');
            DB::statement('CREATE INDEX review_moderations_reviewer_id_index ON review_moderations (reviewer_id)');
        }
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
