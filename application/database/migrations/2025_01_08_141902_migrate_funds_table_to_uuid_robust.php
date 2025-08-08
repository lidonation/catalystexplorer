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
        echo "Starting Fund UUID migration...\n";
        
        // Step 1: Add uuid column to funds table and populate it
        echo "Step 1: Adding UUID column to funds table...\n";
        Schema::table('funds', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->index('uuid');
        });

        // Populate uuid column with new UUIDs
        echo "Populating UUID values...\n";
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
        echo "UUID column added and populated.\n";

        // Step 2: Add new UUID foreign key columns to related tables
        echo "Step 2: Adding UUID foreign key columns to related tables...\n";
        $relatedTables = [
            'proposals' => 'fund_id',
            'campaigns' => 'fund_id', 
            'bookmark_collections' => 'fund_id',
            'milestones' => 'fund_id',
        ];

        foreach ($relatedTables as $tableName => $foreignKeyColumn) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, $foreignKeyColumn)) {
                echo "  Adding UUID column to {$tableName}...\n";
                Schema::table($tableName, function (Blueprint $table) use ($foreignKeyColumn) {
                    $table->uuid("{$foreignKeyColumn}_uuid")->nullable()->after($foreignKeyColumn);
                });

                // Populate new UUID foreign keys
                DB::statement("
                    UPDATE {$tableName} 
                    SET {$foreignKeyColumn}_uuid = funds.uuid
                    FROM funds 
                    WHERE {$tableName}.{$foreignKeyColumn} = funds.id
                    AND {$tableName}.{$foreignKeyColumn} IS NOT NULL
                ");
                echo "  UUID column populated in {$tableName}.\n";
            }
        }

        // Step 3: Handle parent_id self-reference in funds table
        echo "Step 3: Handling parent_id self-reference...\n";
        if (Schema::hasColumn('funds', 'parent_id')) {
            Schema::table('funds', function (Blueprint $table) {
                $table->uuid('parent_uuid')->nullable()->after('parent_id');
            });

            // Populate parent_uuid with corresponding UUIDs
            DB::statement("
                UPDATE funds as f1
                SET parent_uuid = f2.uuid
                FROM funds as f2
                WHERE f1.parent_id = f2.id
                AND f1.parent_id IS NOT NULL
            ");
            echo "Parent UUID column added and populated.\n";
        }

        // Step 4: Backup media relationships for funds if any exist
        echo "Step 4: Backing up media relationships...\n";
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
            echo "Media relationships backed up.\n";
        } else {
            echo "No media relationships found for funds.\n";
        }

        // Step 5: Find and drop all foreign key constraints that reference funds.id
        echo "Step 5: Finding and dropping foreign key constraints...\n";
        
        // Query to find all foreign key constraints referencing funds.id
        $constraints = DB::select("
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
                AND tc.table_schema = current_schema()
        ");
        
        echo "Found " . count($constraints) . " foreign key constraints referencing funds.id:\n";
        foreach ($constraints as $constraint) {
            echo "  - {$constraint->constraint_name} on table {$constraint->table_name}\n";
        }

        // Drop each constraint found using raw SQL
        foreach ($constraints as $constraint) {
            try {
                DB::statement("ALTER TABLE {$constraint->table_name} DROP CONSTRAINT {$constraint->constraint_name}");
                echo "  ✓ Dropped constraint: {$constraint->constraint_name}\n";
            } catch (Exception $e) {
                echo "  ✗ Could not drop constraint {$constraint->constraint_name}: " . $e->getMessage() . "\n";
                // Continue - we'll handle missing constraints gracefully
            }
        }

        // Step 6: Swap primary key from id to uuid using raw SQL
        echo "Step 6: Swapping primary key from integer to UUID...\n";
        
        try {
            // Find the primary key constraint name
            $pkConstraint = DB::selectOne("
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE table_name = 'funds' 
                AND constraint_type = 'PRIMARY KEY'
                AND table_schema = current_schema()
            ");
            
            if ($pkConstraint) {
                DB::statement("ALTER TABLE funds DROP CONSTRAINT {$pkConstraint->constraint_name}");
                echo "  ✓ Dropped primary key constraint: {$pkConstraint->constraint_name}\n";
            }
        } catch (Exception $e) {
            echo "  ✗ Could not drop primary key constraint: " . $e->getMessage() . "\n";
        }

        // Rename columns
        DB::statement('ALTER TABLE funds RENAME COLUMN id TO legacy_id');
        DB::statement('ALTER TABLE funds RENAME COLUMN uuid TO id');
        echo "  ✓ Renamed columns: id -> legacy_id, uuid -> id\n";
        
        // Add new UUID primary key
        DB::statement('ALTER TABLE funds ADD PRIMARY KEY (id)');
        echo "  ✓ Added new UUID primary key\n";

        // Step 7: Update related tables to use UUID foreign keys
        echo "Step 7: Updating related tables to use UUID foreign keys...\n";
        
        foreach ($relatedTables as $tableName => $foreignKeyColumn) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, "{$foreignKeyColumn}_uuid")) {
                echo "  Updating {$tableName}...\n";
                
                // Drop old column and rename UUID column using raw SQL
                DB::statement("ALTER TABLE {$tableName} DROP COLUMN {$foreignKeyColumn}");
                DB::statement("ALTER TABLE {$tableName} RENAME COLUMN {$foreignKeyColumn}_uuid TO {$foreignKeyColumn}");
                
                // Add new foreign key constraint
                $constraintName = "{$tableName}_{$foreignKeyColumn}_foreign";
                DB::statement("ALTER TABLE {$tableName} ADD CONSTRAINT {$constraintName} FOREIGN KEY ({$foreignKeyColumn}) REFERENCES funds(id) ON DELETE CASCADE");
                
                echo "    ✓ Updated {$tableName}.{$foreignKeyColumn} to use UUID\n";
            }
        }

        // Step 8: Handle parent_id self-reference
        echo "Step 8: Handling parent_id self-reference...\n";
        if (Schema::hasColumn('funds', 'parent_uuid')) {
            DB::statement('ALTER TABLE funds DROP COLUMN parent_id');
            DB::statement('ALTER TABLE funds RENAME COLUMN parent_uuid TO parent_id');
            DB::statement('ALTER TABLE funds ADD CONSTRAINT funds_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES funds(id) ON DELETE CASCADE');
            echo "  ✓ Updated parent_id self-reference to use UUID\n";
        }

        // Step 9: Update media relationships for funds if they existed
        echo "Step 9: Updating media relationships...\n";
        if ($fundMediaExists) {
            DB::statement("
                UPDATE media 
                SET model_id = temp_fund_media.fund_uuid
                FROM temp_fund_media
                WHERE media.id = temp_fund_media.media_id
            ");
            echo "  ✓ Updated media relationships to use UUID\n";
        }

        // Step 10: Update any other references to the old Fund ID column
        echo "Step 10: Updating snapshot relationships...\n";
        if (Schema::hasTable('voting_powers') && Schema::hasTable('snapshots')) {
            $snapshotFundExists = DB::table('snapshots')
                ->where('model_type', 'App\\Models\\Fund')
                ->exists();
                
            if ($snapshotFundExists) {
                // Check if snapshots.model_id is string type (can handle UUIDs) or needs to be converted
                $modelIdType = DB::selectOne("
                    SELECT data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'snapshots' 
                    AND column_name = 'model_id'
                    AND table_schema = current_schema()
                ")->data_type;
                
                if (in_array($modelIdType, ['character varying', 'varchar', 'text'])) {
                    // Model ID column can handle UUID strings directly
                    DB::statement("
                        UPDATE snapshots 
                        SET model_id = funds.id
                        FROM funds 
                        WHERE snapshots.model_id = funds.legacy_id::text
                        AND snapshots.model_type = 'App\\Models\\Fund'
                    ");
                    echo "  ✓ Updated snapshot relationships to use UUID strings\n";
                } else {
                    // Model ID column is integer type - we need to convert it to varchar first
                    echo "  Converting snapshots.model_id column to varchar to support UUIDs...\n";
                    
                    // Add new varchar column
                    DB::statement('ALTER TABLE snapshots ADD COLUMN model_id_uuid varchar(255)');
                    
                    // Copy existing data as strings
                    DB::statement('UPDATE snapshots SET model_id_uuid = model_id::text WHERE model_id IS NOT NULL');
                    
                    // Update fund references to use UUIDs
                    DB::statement("
                        UPDATE snapshots 
                        SET model_id_uuid = funds.id
                        FROM funds 
                        WHERE snapshots.model_id = funds.legacy_id
                        AND snapshots.model_type = 'App\\Models\\Fund'
                    ");
                    
                    // Drop old column and rename new one
                    DB::statement('ALTER TABLE snapshots DROP COLUMN model_id');
                    DB::statement('ALTER TABLE snapshots RENAME COLUMN model_id_uuid TO model_id');
                    
                    echo "  ✓ Converted snapshots.model_id to varchar and updated Fund relationships\n";
                }
            } else {
                echo "  No snapshot relationships found for funds.\n";
            }
        }

        echo "✅ Fund UUID migration completed successfully!\n";
    }

    public function down(): void
    {
        echo "Reversing Fund UUID migration...\n";
        
        // Step 1: Backup current UUID relationships
        DB::statement("
            CREATE TEMPORARY TABLE temp_fund_uuid_backup AS
            SELECT 
                id as uuid_id,
                legacy_id as original_id
            FROM funds
        ");

        // Step 2: Restore integer primary key
        $pkConstraint = DB::selectOne("
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'funds' 
            AND constraint_type = 'PRIMARY KEY'
            AND table_schema = current_schema()
        ");
        
        if ($pkConstraint) {
            DB::statement("ALTER TABLE funds DROP CONSTRAINT {$pkConstraint->constraint_name}");
        }
        
        DB::statement('ALTER TABLE funds RENAME COLUMN id TO uuid');
        DB::statement('ALTER TABLE funds RENAME COLUMN legacy_id TO id');
        DB::statement('ALTER TABLE funds ADD PRIMARY KEY (id)');

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
                try {
                    DB::statement("ALTER TABLE {$tableName} DROP CONSTRAINT {$tableName}_{$foreignKeyColumn}_foreign");
                } catch (Exception $e) {
                    // Constraint might not exist
                }
                
                DB::statement("ALTER TABLE {$tableName} DROP COLUMN {$foreignKeyColumn}");
                DB::statement("ALTER TABLE {$tableName} RENAME COLUMN {$foreignKeyColumn}_int TO {$foreignKeyColumn}");
                DB::statement("ALTER TABLE {$tableName} ADD CONSTRAINT {$tableName}_{$foreignKeyColumn}_foreign FOREIGN KEY ({$foreignKeyColumn}) REFERENCES funds(id)");
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
        
        echo "✅ Fund UUID migration rollback completed!\n";
    }
};
