<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::transaction(function () {
            // First, migrate review_moderations table to UUID
            $this->migrateReviewModerationsToUuid();
            
            // Then fix foreign keys in review_moderation_reviewers (empty table)
            $this->fixReviewModerationReviewersSchema();
            
            // Finally, fix context_id in reviewer_reputation_scores
            $this->fixReviewerReputationScoresContextId();
        });
    }

    private function migrateReviewModerationsToUuid(): void
    {
        echo "Migrating review_moderations table to UUID...\n";
        
        // First drop any existing foreign key constraints from review_moderation_reviewers
        if (Schema::hasTable('review_moderation_reviewers')) {
            try {
                Schema::table('review_moderation_reviewers', function (Blueprint $table) {
                    $table->dropForeign('review_moderation_reviewers_review_moderation_id_foreign');
                });
                echo "Dropped foreign key constraint.\n";
            } catch (Exception $e) {
                echo "No foreign key constraint to drop or already dropped.\n";
            }
        }
        
        // Add UUID column
        Schema::table('review_moderations', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
        });
        
        // Generate UUIDs for existing records
        $records = DB::table('review_moderations')->get();
        foreach ($records as $record) {
            DB::table('review_moderations')
                ->where('id', $record->id)
                ->update(['uuid' => Str::uuid()]);
        }
        
        // Make uuid non-nullable if there are records
        if ($records->count() > 0) {
            Schema::table('review_moderations', function (Blueprint $table) {
                $table->uuid('uuid')->nullable(false)->change();
            });
        }
        
        // Drop old primary key and create new one
        Schema::table('review_moderations', function (Blueprint $table) {
            $table->dropPrimary();
            $table->dropColumn('id');
            $table->renameColumn('uuid', 'id');
        });
        
        // Add primary key constraint
        Schema::table('review_moderations', function (Blueprint $table) {
            $table->primary('id');
        });
        
        // Fix reviewer_id foreign key
        Schema::table('review_moderations', function (Blueprint $table) {
            $table->uuid('reviewer_uuid')->nullable()->after('reviewer_id');
        });
        
        // Map reviewer bigint IDs to UUIDs
        $reviewModerations = DB::table('review_moderations')->whereNotNull('reviewer_id')->get();
        foreach ($reviewModerations as $moderation) {
            $reviewer = DB::table('reviewers')
                ->where('old_id', $moderation->reviewer_id)
                ->first();
            
            if ($reviewer) {
                DB::table('review_moderations')
                    ->where('id', $moderation->id)
                    ->update(['reviewer_uuid' => $reviewer->id]);
            }
        }
        
        // Drop old reviewer_id and rename reviewer_uuid
        Schema::table('review_moderations', function (Blueprint $table) {
            $table->dropColumn('reviewer_id');
            $table->renameColumn('reviewer_uuid', 'reviewer_id');
        });
        
        // Add foreign key constraint
        Schema::table('review_moderations', function (Blueprint $table) {
            $table->foreign('reviewer_id')->references('id')->on('reviewers')->onDelete('cascade');
        });
        
        echo "review_moderations migration completed.\n";
    }
    
    private function fixReviewModerationReviewersSchema(): void
    {
        echo "Fixing review_moderation_reviewers table schema...\n";
        
        // Since table is empty, we can simply recreate it with correct schema
        Schema::dropIfExists('review_moderation_reviewers');
        
        Schema::create('review_moderation_reviewers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('review_moderation_id');
            $table->uuid('review_id');
            $table->uuid('reviewer_id');
            
            // Add foreign key constraints
            $table->foreign('review_moderation_id')->references('id')->on('review_moderations')->onDelete('cascade');
            $table->foreign('review_id')->references('id')->on('reviews')->onDelete('cascade');
            $table->foreign('reviewer_id')->references('id')->on('reviewers')->onDelete('cascade');
            
            // Add unique constraint to prevent duplicates
            $table->unique(['review_moderation_id', 'review_id', 'reviewer_id'], 'review_moderation_reviewers_unique');
        });
        
        echo "review_moderation_reviewers schema fixed.\n";
    }
    
    private function fixReviewerReputationScoresContextId(): void
    {
        echo "Fixing reviewer_reputation_scores context_id column...\n";
        
        // Add UUID column for context_id
        Schema::table('reviewer_reputation_scores', function (Blueprint $table) {
            $table->uuid('context_uuid')->nullable()->after('context_id');
        });
        
        // Since the old_id columns for funds were dropped in the cleanup migration,
        // and we can't map the orphaned bigint context_ids to UUIDs,
        // we need to handle this as orphaned data.
        
        $fundRecords = DB::table('reviewer_reputation_scores')
            ->where('context_type', 'App\\Models\\CatalystExplorer\\Fund')
            ->whereNotNull('context_id')
            ->get();
        
        $orphanedCount = 0;
        $mappedCount = 0;
        
        foreach ($fundRecords as $record) {
            // Since funds.old_id no longer exists, we cannot map these records
            // Set the context_uuid to null for orphaned records
            echo "Setting context_uuid to null for orphaned reputation score {$record->id} (old context_id: {$record->context_id})\n";
            DB::table('reviewer_reputation_scores')
                ->where('id', $record->id)
                ->update(['context_uuid' => null]);
            $orphanedCount++;
        }
        
        echo "Processed {$orphanedCount} orphaned fund context references.\n";
        
        // Drop old context_id and rename context_uuid
        Schema::table('reviewer_reputation_scores', function (Blueprint $table) {
            $table->dropColumn('context_id');
            $table->renameColumn('context_uuid', 'context_id');
        });
        
        echo "reviewer_reputation_scores context_id fixed.\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::transaction(function () {
            // Reverse reviewer_reputation_scores changes
            Schema::table('reviewer_reputation_scores', function (Blueprint $table) {
                $table->bigInteger('context_bigint')->nullable()->after('context_id');
            });
            
            // Map back to bigint IDs
            $fundRecords = DB::table('reviewer_reputation_scores')
                ->where('context_type', 'App\\Models\\CatalystExplorer\\Fund')
                ->whereNotNull('context_id')
                ->get();
                
            foreach ($fundRecords as $record) {
                $fund = DB::table('funds')->where('id', $record->context_id)->first();
                if ($fund && isset($fund->old_id)) {
                    DB::table('reviewer_reputation_scores')
                        ->where('id', $record->id)
                        ->update(['context_bigint' => $fund->old_id]);
                }
            }
            
            Schema::table('reviewer_reputation_scores', function (Blueprint $table) {
                $table->dropColumn('context_id');
                $table->renameColumn('context_bigint', 'context_id');
            });
            
            // Reverse review_moderation_reviewers changes
            Schema::dropIfExists('review_moderation_reviewers');
            Schema::create('review_moderation_reviewers', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->bigInteger('review_moderation_id');
                $table->bigInteger('review_id');
                $table->bigInteger('reviewer_id');
            });
            
            // Reverse review_moderations changes
            Schema::table('review_moderations', function (Blueprint $table) {
                $table->dropForeign(['reviewer_id']);
                $table->dropPrimary();
                $table->bigIncrements('bigint_id')->first();
            });
            
            // Map UUIDs back to bigints and restore old schema
            $records = DB::table('review_moderations')->get();
            $idMap = [];
            foreach ($records as $index => $record) {
                $newId = $index + 1;
                $idMap[$record->id] = $newId;
                DB::table('review_moderations')
                    ->where('id', $record->id)
                    ->update(['bigint_id' => $newId]);
            }
            
            Schema::table('review_moderations', function (Blueprint $table) {
                $table->dropColumn('id');
                $table->renameColumn('bigint_id', 'id');
                $table->primary('id');
                
                $table->bigInteger('reviewer_bigint')->nullable()->after('reviewer_id');
            });
            
            // Map reviewer UUIDs back to bigints
            $reviewModerations = DB::table('review_moderations')->whereNotNull('reviewer_id')->get();
            foreach ($reviewModerations as $moderation) {
                $reviewer = DB::table('reviewers')
                    ->where('id', $moderation->reviewer_id)
                    ->first();
                
                if ($reviewer && isset($reviewer->old_id)) {
                    DB::table('review_moderations')
                        ->where('id', $moderation->id)
                        ->update(['reviewer_bigint' => $reviewer->old_id]);
                }
            }
            
            Schema::table('review_moderations', function (Blueprint $table) {
                $table->dropColumn('reviewer_id');
                $table->renameColumn('reviewer_bigint', 'reviewer_id');
            });
        });
    }
};
