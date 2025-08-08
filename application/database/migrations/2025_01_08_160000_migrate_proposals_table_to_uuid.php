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
        // Log start of migration
        echo "Starting Proposal UUID migration...\n";

        // Step 1: Add UUID column to proposals table
        echo "Step 1: Adding UUID column to proposals table...\n";
        Schema::table('proposals', function (Blueprint $table) {
            $table->uuid('uuid')->after('id')->nullable()->index();
        });

        // Step 2: Populate UUID column
        echo "Step 2: Populating UUID column...\n";
        $proposals = DB::table('proposals')->select('id')->get();
        foreach ($proposals as $proposal) {
            DB::table('proposals')
                ->where('id', $proposal->id)
                ->update(['uuid' => (string) \Illuminate\Support\Str::uuid()]);
        }

        // Step 3: Update fund_id to reference UUID-based funds
        echo "Step 3: Updating fund_id to UUID reference...\n";
        Schema::table('proposals', function (Blueprint $table) {
            $table->uuid('fund_uuid')->after('fund_id')->nullable()->index();
        });

        // Populate fund_uuid from funds.id based on fund_id (since fund_id is already UUID)
        DB::statement("
            UPDATE proposals 
            SET fund_uuid = funds.id 
            FROM funds 
            WHERE proposals.fund_id = funds.id 
            AND proposals.fund_id IS NOT NULL
        ");

        // Step 4: Update all pivot tables to use UUID foreign keys

        // Update ideascale_profile_has_proposal
        echo "Step 4a: Updating ideascale_profile_has_proposal table...\n";
        if (Schema::hasTable('ideascale_profile_has_proposal')) {
            Schema::table('ideascale_profile_has_proposal', function (Blueprint $table) {
                $table->uuid('proposal_uuid')->after('proposal_id')->nullable()->index();
            });

            DB::statement("
                UPDATE ideascale_profile_has_proposal 
                SET proposal_uuid = proposals.uuid 
                FROM proposals 
                WHERE ideascale_profile_has_proposal.proposal_id = proposals.id
            ");
        }

        // Update group_has_proposal
        echo "Step 4b: Updating group_has_proposal table...\n";
        if (Schema::hasTable('group_has_proposal')) {
            Schema::table('group_has_proposal', function (Blueprint $table) {
                $table->uuid('proposal_uuid')->after('proposal_id')->nullable()->index();
            });

            DB::statement("
                UPDATE group_has_proposal 
                SET proposal_uuid = proposals.uuid 
                FROM proposals 
                WHERE group_has_proposal.proposal_id = proposals.id
            ");
        }

        // Update community_has_proposal
        echo "Step 4c: Updating community_has_proposal table...\n";
        if (Schema::hasTable('community_has_proposal')) {
            Schema::table('community_has_proposal', function (Blueprint $table) {
                $table->uuid('proposal_uuid')->after('proposal_id')->nullable()->index();
            });

            DB::statement("
                UPDATE community_has_proposal 
                SET proposal_uuid = proposals.uuid 
                FROM proposals 
                WHERE community_has_proposal.proposal_id = proposals.id
            ");
        }

        // Update catalyst_profile_has_proposal
        echo "Step 4d: Updating catalyst_profile_has_proposal table...\n";
        if (Schema::hasTable('catalyst_profile_has_proposal')) {
            Schema::table('catalyst_profile_has_proposal', function (Blueprint $table) {
                $table->uuid('proposal_uuid')->after('proposal_id')->nullable()->index();
            });

            DB::statement("
                UPDATE catalyst_profile_has_proposal 
                SET proposal_uuid = proposals.uuid 
                FROM proposals 
                WHERE catalyst_profile_has_proposal.proposal_id = proposals.id
            ");
        }

        // Update proposal_profiles (polymorphic pivot)
        echo "Step 4e: Updating proposal_profiles table...\n";
        if (Schema::hasTable('proposal_profiles')) {
            Schema::table('proposal_profiles', function (Blueprint $table) {
                $table->uuid('proposal_uuid')->after('proposal_id')->nullable()->index();
            });

            DB::statement("
                UPDATE proposal_profiles 
                SET proposal_uuid = proposals.uuid 
                FROM proposals 
                WHERE proposal_profiles.proposal_id = proposals.id
            ");
        }

        // Update milestone-related tables
        echo "Step 4f: Updating milestone-related tables...\n";
        
        // milestone table
        if (Schema::hasTable('milestone')) {
            Schema::table('milestone', function (Blueprint $table) {
                $table->uuid('proposal_uuid')->after('proposal_id')->nullable()->index();
            });

            DB::statement("
                UPDATE milestone 
                SET proposal_uuid = proposals.uuid 
                FROM proposals 
                WHERE milestone.proposal_id = proposals.id
            ");
        }

        // proposal_milestones table
        if (Schema::hasTable('proposal_milestones')) {
            Schema::table('proposal_milestones', function (Blueprint $table) {
                $table->uuid('proposal_uuid')->after('proposal_id')->nullable()->index();
            });

            DB::statement("
                UPDATE proposal_milestones 
                SET proposal_uuid = proposals.uuid 
                FROM proposals 
                WHERE proposal_milestones.proposal_id = proposals.id
            ");
        }

        // milestone_som_reviews table
        if (Schema::hasTable('milestone_som_reviews')) {
            Schema::table('milestone_som_reviews', function (Blueprint $table) {
                $table->uuid('proposal_uuid')->after('proposal_id')->nullable()->index();
            });

            DB::statement("
                UPDATE milestone_som_reviews 
                SET proposal_uuid = proposals.uuid 
                FROM proposals 
                WHERE milestone_som_reviews.proposal_id = proposals.id
            ");
        }

        // milestone_poas table
        if (Schema::hasTable('milestone_poas')) {
            Schema::table('milestone_poas', function (Blueprint $table) {
                $table->uuid('proposal_uuid')->after('proposal_id')->nullable()->index();
            });

            DB::statement("
                UPDATE milestone_poas 
                SET proposal_uuid = proposals.uuid 
                FROM proposals 
                WHERE milestone_poas.proposal_id = proposals.id
            ");
        }

        // milestone_poas_signoffs table
        if (Schema::hasTable('milestone_poas_signoffs')) {
            Schema::table('milestone_poas_signoffs', function (Blueprint $table) {
                $table->uuid('proposal_uuid')->after('proposal_id')->nullable()->index();
            });

            DB::statement("
                UPDATE milestone_poas_signoffs 
                SET proposal_uuid = proposals.uuid 
                FROM proposals 
                WHERE milestone_poas_signoffs.proposal_id = proposals.id
            ");
        }

        // milestone_poas_reviews table
        if (Schema::hasTable('milestone_poas_reviews')) {
            Schema::table('milestone_poas_reviews', function (Blueprint $table) {
                $table->uuid('proposal_uuid')->after('proposal_id')->nullable()->index();
            });

            DB::statement("
                UPDATE milestone_poas_reviews 
                SET proposal_uuid = proposals.uuid 
                FROM proposals 
                WHERE milestone_poas_reviews.proposal_id = proposals.id
            ");
        }

        // Update other related tables
        echo "Step 4g: Updating other related tables...\n";
        
        // cardano_budget_proposals table
        if (Schema::hasTable('cardano_budget_proposals') && Schema::hasColumn('cardano_budget_proposals', 'proposal_id')) {
            if (!Schema::hasColumn('cardano_budget_proposals', 'proposal_uuid')) {
                Schema::table('cardano_budget_proposals', function (Blueprint $table) {
                    $table->uuid('proposal_uuid')->after('proposal_id')->nullable()->index();
                });
            }

            DB::statement("
                UPDATE cardano_budget_proposals 
                SET proposal_uuid = proposals.uuid 
                FROM proposals 
                WHERE cardano_budget_proposals.proposal_id = proposals.id
            ");
        }

        // Update polymorphic relationships in media table for proposals
        echo "Step 4h: Updating media polymorphic relationships...\n";
        if (Schema::hasColumn('media', 'model_type') && Schema::hasColumn('media', 'model_id')) {
            // Add temporary UUID column for media
            if (!Schema::hasColumn('media', 'model_uuid')) {
                Schema::table('media', function (Blueprint $table) {
                    $table->string('model_uuid', 36)->nullable()->after('model_id')->index();
                });
            }

            // Update proposal media relationships
            DB::statement("
                UPDATE media 
                SET model_uuid = proposals.uuid 
                FROM proposals 
                WHERE media.model_type = ? 
                AND media.model_id::bigint = proposals.id
            ", ['App\\Models\\Proposal']);
        }

        // Update polymorphic relationships in other tables that might reference proposals
        $polymorphicTables = ['translations', 'comments', 'ratings', 'discussions', 'moderations'];
        
        foreach ($polymorphicTables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'model_type') && Schema::hasColumn($tableName, 'model_id')) {
                echo "Step 4i: Updating {$tableName} polymorphic relationships...\n";
                
                // Add temporary UUID column if not exists
                if (!Schema::hasColumn($tableName, 'model_uuid')) {
                    Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                        $table->string('model_uuid', 36)->nullable()->after('model_id')->index();
                    });
                }

                // Update proposal polymorphic relationships
                DB::statement("
                    UPDATE {$tableName} 
                    SET model_uuid = proposals.uuid 
                    FROM proposals 
                    WHERE {$tableName}.model_type = ? 
                    AND {$tableName}.model_id::bigint = proposals.id
                ", ['App\\Models\\Proposal']);
            }
        }

        // Step 5: Drop old foreign key constraints and integer columns
        echo "Step 5: Dropping old constraints and columns...\n";

        // Get all foreign key constraints that reference the old proposal_id columns
        $constraintsToDrop = [
            'ideascale_profile_has_proposal' => ['proposal_id'],
            'group_has_proposal' => ['proposal_id'],  
            'community_has_proposal' => ['proposal_id'],
            'catalyst_profile_has_proposal' => ['proposal_id'],
            'proposal_profiles' => ['proposal_id'],
            'milestone' => ['proposal_id'],
            'proposal_milestones' => ['proposal_id'],
            'milestone_som_reviews' => ['proposal_id'],
            'milestone_poas' => ['proposal_id'],
            'milestone_poas_signoffs' => ['proposal_id'],
            'milestone_poas_reviews' => ['proposal_id'],
            'cardano_budget_proposals' => ['proposal_id'],
        ];

        foreach ($constraintsToDrop as $table => $columns) {
            if (Schema::hasTable($table)) {
                foreach ($columns as $column) {
                    if (Schema::hasColumn($table, $column)) {
                        // Drop foreign key constraints
                        $foreignKeys = DB::select("
                            SELECT constraint_name 
                            FROM information_schema.table_constraints 
                            WHERE table_name = ? 
                            AND constraint_type = 'FOREIGN KEY'
                        ", [$table]);

                        Schema::table($table, function (Blueprint $tableSchema) use ($foreignKeys, $table) {
                            foreach ($foreignKeys as $fk) {
                                try {
                                    $tableSchema->dropForeign($fk->constraint_name);
                                } catch (Exception $e) {
                                    // Ignore if constraint doesn't exist
                                }
                            }
                        });

                        // Drop the old integer column
                        Schema::table($table, function (Blueprint $tableSchema) use ($column) {
                            $tableSchema->dropColumn($column);
                        });

                        // Rename UUID column to replace the old column
                        $uuidColumn = str_replace('_id', '_uuid', $column);
                        Schema::table($table, function (Blueprint $tableSchema) use ($uuidColumn, $column) {
                            $tableSchema->renameColumn($uuidColumn, $column);
                        });
                    }
                }
            }
        }

        // Step 6: Update proposals table structure
        echo "Step 6: Updating proposals table structure...\n";

        // Drop old fund_id column and rename fund_uuid
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropColumn('fund_id');
        });

        Schema::table('proposals', function (Blueprint $table) {
            $table->renameColumn('fund_uuid', 'fund_id');
        });

        // Step 7: Switch proposals primary key to UUID
        echo "Step 7: Switching proposals primary key to UUID...\n";

        // Save the legacy ID
        Schema::table('proposals', function (Blueprint $table) {
            $table->bigInteger('legacy_id')->nullable()->after('uuid')->index();
        });

        DB::statement('UPDATE proposals SET legacy_id = id');

        // Drop the old primary key constraint
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropPrimary();
        });

        // Drop the old id column
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        // Rename uuid to id and make it primary
        Schema::table('proposals', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
        });

        Schema::table('proposals', function (Blueprint $table) {
            $table->primary('id');
        });

        // Step 8: Update polymorphic model_id columns to use UUIDs
        echo "Step 8: Finalizing polymorphic relationships...\n";
        
        // Handle media table polymorphic relationships
        if (Schema::hasColumn('media', 'model_uuid')) {
            // First change the column type to support both integer and UUID strings
            Schema::table('media', function (Blueprint $table) {
                $table->string('model_id', 255)->change();
            });
            
            // Update model_id with UUID values for proposals
            DB::statement("
                UPDATE media 
                SET model_id = model_uuid 
                WHERE model_type = ? 
                AND model_uuid IS NOT NULL
            ", ['App\\Models\\Proposal']);

            // Drop temporary uuid column
            Schema::table('media', function (Blueprint $table) {
                $table->dropColumn('model_uuid');
            });
        }

        // Handle other polymorphic tables
        foreach ($polymorphicTables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'model_uuid')) {
                // First change the column type to support both integer and UUID strings
                Schema::table($tableName, function (Blueprint $table) {
                    $table->string('model_id', 255)->change();
                });
                
                // Update model_id with UUID values for proposals
                DB::statement("
                    UPDATE {$tableName} 
                    SET model_id = model_uuid 
                    WHERE model_type = ? 
                    AND model_uuid IS NOT NULL
                ", ['App\\Models\\Proposal']);

                // Drop temporary uuid column
                Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                    $table->dropColumn('model_uuid');
                });
            }
        }

        // Step 9: Add foreign key constraints for the new UUID-based relationships
        echo "Step 9: Adding new foreign key constraints...\n";

        // Add foreign key constraint for fund_id (UUID)
        Schema::table('proposals', function (Blueprint $table) {
            $table->foreign('fund_id')->references('id')->on('funds');
        });

        // Add foreign key constraints for pivot tables
        $foreignKeyMappings = [
            'ideascale_profile_has_proposal' => ['proposal_id' => 'proposals.id'],
            'group_has_proposal' => ['proposal_id' => 'proposals.id'],
            'community_has_proposal' => ['proposal_id' => 'proposals.id'],
            'catalyst_profile_has_proposal' => ['proposal_id' => 'proposals.id'],
            'proposal_profiles' => ['proposal_id' => 'proposals.id'],
            'milestone' => ['proposal_id' => 'proposals.id'],
            'proposal_milestones' => ['proposal_id' => 'proposals.id'],
            'milestone_som_reviews' => ['proposal_id' => 'proposals.id'],
            'milestone_poas' => ['proposal_id' => 'proposals.id'],
            'milestone_poas_signoffs' => ['proposal_id' => 'proposals.id'],
            'milestone_poas_reviews' => ['proposal_id' => 'proposals.id'],
            'cardano_budget_proposals' => ['proposal_id' => 'proposals.id'],
        ];

        foreach ($foreignKeyMappings as $table => $constraints) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $tableSchema) use ($constraints, $table) {
                    foreach ($constraints as $column => $reference) {
                        // Only add foreign key if column exists
                        if (Schema::hasColumn($table, $column)) {
                            [$refTable, $refColumn] = explode('.', $reference);
                            $tableSchema->foreign($column)->references($refColumn)->on($refTable);
                        }
                    }
                });
            }
        }

        echo "Proposal UUID migration completed successfully!\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        echo "Starting Proposal UUID migration rollback...\n";

        // This is a complex rollback - implement if needed
        // For now, throw an exception to prevent accidental rollback
        throw new Exception('Proposal UUID migration rollback is not implemented. This migration should not be rolled back in production.');
    }
};
