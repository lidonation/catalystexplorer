<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Add uuid column to funds table and populate it
        Schema::table('funds', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->index('uuid');
        });

        // Populate uuid column with new UUIDs
        DB::table('funds')->whereNull('uuid')->chunkById(1000, function ($funds) {
            foreach ($funds as $fund) {
                DB::table('funds')
                    ->where('id', $fund->id)
                    ->update(['uuid' => Str::uuid()->toString()]);
            }
        });

        // Make uuid non-nullable
        Schema::table('funds', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
        });

        // Step 2: Add new UUID foreign key columns to related tables
        $relatedTables = [
            'proposals' => 'fund_id',
            'campaigns' => 'fund_id', 
            'bookmark_collections' => 'fund_id',
            'milestones' => 'fund_id',
        ];

        foreach ($relatedTables as $tableName => $foreignKeyColumn) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, $foreignKeyColumn)) {
                Schema::table($tableName, function (Blueprint $table) use ($foreignKeyColumn) {
                    $table->uuid("{$foreignKeyColumn}_uuid")->nullable()->after($foreignKeyColumn);
                    $table->index("{$foreignKeyColumn}_uuid");
                });

                // Populate new UUID foreign keys
                DB::statement("
                    UPDATE {$tableName} 
                    SET {$foreignKeyColumn}_uuid = funds.uuid
                    FROM funds 
                    WHERE {$tableName}.{$foreignKeyColumn} = funds.id
                    AND {$tableName}.{$foreignKeyColumn} IS NOT NULL
                ");
            }
        }

        // Step 3: Handle parent_id self-reference in funds table
        if (Schema::hasColumn('funds', 'parent_id')) {
            Schema::table('funds', function (Blueprint $table) {
                $table->uuid('parent_uuid')->nullable()->after('parent_id');
                $table->index('parent_uuid');
            });

            // Populate parent_uuid with corresponding UUIDs
            DB::statement("
                UPDATE funds as f1
                SET parent_uuid = f2.uuid
                FROM funds as f2
                WHERE f1.parent_id = f2.id
                AND f1.parent_id IS NOT NULL
            ");
        }

        // Step 4: Backup media relationships for funds if any exist
        $fundMediaExists = DB::table('media')
            ->where('model_type', 'App\\Models\\Fund')
            ->exists();

        if ($fundMediaExists) {
            DB::statement("
                CREATE TEMPORARY TABLE temp_fund_media AS
                SELECT 
                    media.id as media_id,
                    funds.uuid as fund_uuid,
                    funds.id as fund_legacy_id
                FROM media 
                JOIN funds ON funds.id = media.model_id::integer
                WHERE media.model_type = 'App\\Models\\Fund'
            ");
        }

        // Step 5: First drop all foreign key constraints that depend on funds.id
        // We'll query the database to find actual constraint names instead of guessing
        
        // Find all foreign key constraints that reference funds.id
        $constraintsQuery = "
            SELECT 
                tc.table_name, 
                tc.constraint_name,
                kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage ccu 
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
                AND ccu.table_name = 'funds'
                AND ccu.column_name = 'id'
                AND tc.table_schema = (SELECT schemaname FROM pg_tables WHERE tablename = 'funds' LIMIT 1)
        ";
        
        $constraints = DB::select($constraintsQuery);
        
        // Drop each constraint found
        foreach ($constraints as $constraint) {
            try {
                DB::statement("ALTER TABLE {$constraint->table_name} DROP CONSTRAINT IF EXISTS {$constraint->constraint_name}");
                echo "Dropped constraint: {$constraint->constraint_name} on table {$constraint->table_name}\n";
            } catch (Exception $e) {
                echo "Could not drop constraint {$constraint->constraint_name}: " . $e->getMessage() . "\n";
                // Continue with migration even if we can't drop a constraint
            }
        }

        // Step 6: Swap primary key from id to uuid
        // First rename the old id column to legacy_id
        Schema::table('funds', function (Blueprint $table) {
            $table->renameColumn('id', 'legacy_id');
        });

        // Then rename uuid to id to make it the new primary key
        Schema::table('funds', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
        });

        // Drop old primary key constraint and add new UUID primary key
        Schema::table('funds', function (Blueprint $table) {
            $table->dropPrimary(['legacy_id']);
            $table->primary('id');
        });

        // Step 7: Drop old foreign key constraints and add new UUID constraints
        foreach ($relatedTables as $tableName => $foreignKeyColumn) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, "{$foreignKeyColumn}_uuid")) {
                Schema::table($tableName, function (Blueprint $table) use ($tableName, $foreignKeyColumn) {
                    // Drop old foreign key constraint if it exists
                    try {
                        $table->dropForeign(["{$foreignKeyColumn}"]);
                    } catch (Exception $e) {
                        // Constraint might not exist, continue
                    }
                    
                    // Drop old column and rename UUID column
                    $table->dropColumn($foreignKeyColumn);
                });

                Schema::table($tableName, function (Blueprint $table) use ($foreignKeyColumn) {
                    $table->renameColumn("{$foreignKeyColumn}_uuid", $foreignKeyColumn);
                });

                // Add new foreign key constraint
                Schema::table($tableName, function (Blueprint $table) use ($foreignKeyColumn) {
                    $table->foreign($foreignKeyColumn)->references('id')->on('funds')->onDelete('cascade');
                });
            }
        }

        // Step 8: Handle parent_id self-reference
        if (Schema::hasColumn('funds', 'parent_uuid')) {
            Schema::table('funds', function (Blueprint $table) {
                try {
                    $table->dropForeign(['parent_id']);
                } catch (Exception $e) {
                    // Constraint might not exist, continue
                }
                $table->dropColumn('parent_id');
                $table->renameColumn('parent_uuid', 'parent_id');
            });

            Schema::table('funds', function (Blueprint $table) {
                $table->foreign('parent_id')->references('id')->on('funds')->onDelete('cascade');
            });
        }

        // Step 9: Update media relationships for funds if they existed
        if ($fundMediaExists) {
            DB::statement("
                UPDATE media 
                SET model_id = temp_fund_media.fund_uuid
                FROM temp_fund_media
                WHERE media.id = temp_fund_media.media_id
            ");
        }

        // Step 10: Update any other references to the old Fund ID column
        // Check for any voting_powers relationships through snapshots
        if (Schema::hasTable('voting_powers') && Schema::hasTable('snapshots')) {
            $snapshotFundExists = DB::table('snapshots')
                ->where('model_type', 'App\\Models\\Fund')
                ->exists();
                
            if ($snapshotFundExists) {
                DB::statement("
                    UPDATE snapshots 
                    SET model_id = funds.id
                    FROM funds 
                    WHERE snapshots.model_id::integer = funds.legacy_id
                    AND snapshots.model_type = 'App\\Models\\Fund'
                ");
            }
        }
    }

    public function down(): void
    {
        // This migration is complex to reverse, but here's the basic structure
        
        // Step 1: Backup current UUID relationships
        DB::statement("
            CREATE TEMPORARY TABLE temp_fund_uuid_backup AS
            SELECT 
                id as uuid_id,
                legacy_id as original_id
            FROM funds
        ");

        // Step 2: Restore integer primary key
        Schema::table('funds', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            $table->renameColumn('id', 'uuid');
            $table->renameColumn('legacy_id', 'id');
            $table->primary('id');
        });

        // Step 3: Restore foreign key relationships to use integer IDs
        $relatedTables = [
            'proposals' => 'fund_id',
            'campaigns' => 'fund_id',
            'bookmark_collections' => 'fund_id', 
            'milestones' => 'fund_id',
        ];

        foreach ($relatedTables as $tableName => $foreignKeyColumn) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, $foreignKeyColumn)) {
                // Add temporary integer column
                Schema::table($tableName, function (Blueprint $table) use ($foreignKeyColumn) {
                    $table->unsignedBigInteger("{$foreignKeyColumn}_int")->nullable()->after($foreignKeyColumn);
                });

                // Populate with original integer IDs
                DB::statement("
                    UPDATE {$tableName} 
                    SET {$foreignKeyColumn}_int = temp_fund_uuid_backup.original_id
                    FROM temp_fund_uuid_backup
                    WHERE {$tableName}.{$foreignKeyColumn} = temp_fund_uuid_backup.uuid_id
                ");

                // Drop UUID column and rename integer column back
                Schema::table($tableName, function (Blueprint $table) use ($foreignKeyColumn) {
                    $table->dropForeign([$foreignKeyColumn]);
                    $table->dropColumn($foreignKeyColumn);
                    $table->renameColumn("{$foreignKeyColumn}_int", $foreignKeyColumn);
                });

                // Add back foreign key constraint
                Schema::table($tableName, function (Blueprint $table) use ($foreignKeyColumn) {
                    $table->foreign($foreignKeyColumn)->references('id')->on('funds');
                });
            }
        }

        // Step 4: Remove uuid column
        Schema::table('funds', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });

        // Step 5: Restore media relationships if needed
        $fundMediaExists = DB::table('media')
            ->where('model_type', 'App\\Models\\Fund')
            ->exists();

        if ($fundMediaExists) {
            DB::statement("
                UPDATE media 
                SET model_id = funds.id::text
                FROM funds 
                WHERE media.model_id = funds.uuid
                AND media.model_type = 'App\\Models\\Fund'
            ");
        }
    }
};
