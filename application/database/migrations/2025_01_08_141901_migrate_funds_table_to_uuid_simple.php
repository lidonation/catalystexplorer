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
        // This is a simpler approach that disables foreign key checks temporarily
        
        // Step 1: Disable foreign key checks
        DB::statement('SET foreign_key_checks = 0;'); // MySQL
        // For PostgreSQL, we'll handle it differently
        
        // Step 2: Add uuid column to funds table and populate it
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

        // Step 3: Add new UUID foreign key columns to related tables
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

        // Step 4: Handle parent_id self-reference in funds table
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
        }

        // Step 5: Backup media relationships for funds if any exist
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

        // Step 6: Use raw SQL to avoid Laravel's constraint handling
        // Rename columns directly with SQL
        DB::statement('ALTER TABLE funds RENAME COLUMN id TO legacy_id');
        DB::statement('ALTER TABLE funds RENAME COLUMN uuid TO id');
        
        // Drop primary key and create new one
        DB::statement('ALTER TABLE funds DROP CONSTRAINT funds_pkey');
        DB::statement('ALTER TABLE funds ADD PRIMARY KEY (id)');

        // Step 7: Update related tables to use UUID foreign keys
        foreach ($relatedTables as $tableName => $foreignKeyColumn) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, "{$foreignKeyColumn}_uuid")) {
                // Drop old column and rename UUID column using raw SQL
                DB::statement("ALTER TABLE {$tableName} DROP COLUMN {$foreignKeyColumn}");
                DB::statement("ALTER TABLE {$tableName} RENAME COLUMN {$foreignKeyColumn}_uuid TO {$foreignKeyColumn}");
                
                // Add new foreign key constraint
                DB::statement("ALTER TABLE {$tableName} ADD CONSTRAINT {$tableName}_{$foreignKeyColumn}_foreign FOREIGN KEY ({$foreignKeyColumn}) REFERENCES funds(id) ON DELETE CASCADE");
            }
        }

        // Step 8: Handle parent_id self-reference
        if (Schema::hasColumn('funds', 'parent_uuid')) {
            DB::statement('ALTER TABLE funds DROP COLUMN parent_id');
            DB::statement('ALTER TABLE funds RENAME COLUMN parent_uuid TO parent_id');
            DB::statement('ALTER TABLE funds ADD CONSTRAINT funds_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES funds(id) ON DELETE CASCADE');
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

        // Step 11: Re-enable foreign key checks
        DB::statement('SET foreign_key_checks = 1;'); // MySQL
    }

    public function down(): void
    {
        // Reverse migration - restore integer primary key
        
        // Step 1: Backup current UUID relationships
        DB::statement("
            CREATE TEMPORARY TABLE temp_fund_uuid_backup AS
            SELECT 
                id as uuid_id,
                legacy_id as original_id
            FROM funds
        ");

        // Step 2: Restore integer primary key
        DB::statement('ALTER TABLE funds DROP CONSTRAINT funds_pkey');
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
                DB::statement("ALTER TABLE {$tableName} DROP CONSTRAINT {$tableName}_{$foreignKeyColumn}_foreign");
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
    }
};
