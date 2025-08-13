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
        // Each step in its own transaction to avoid transaction abort issues
        DB::transaction(function () {
            $this->dropForeignKeyConstraints();
        });

        DB::transaction(function () {
            $this->switchGroupsPrimaryKey();
        });

        DB::transaction(function () {
            $this->updateReferencingTables();
        });
        
        DB::transaction(function () {
            $this->updatePolymorphicReferences();
        });

        DB::transaction(function () {
            $this->addForeignKeyConstraints();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::transaction(function () {
            $this->dropNewForeignKeyConstraints();
        });
        
        DB::transaction(function () {
            $this->revertPolymorphicReferences();
        });
        
        DB::transaction(function () {
            $this->revertReferencingTables();
        });

        DB::transaction(function () {
            $this->revertGroupsPrimaryKey();
        });

        DB::transaction(function () {
            $this->restoreOriginalForeignKeyConstraints();
        });
    }

    private function dropForeignKeyConstraints(): void
    {
        $tables = ['group_has_ideascale_profile', 'group_has_proposal'];
        
        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'group_id')) {
                try {
                    // Get actual constraint name from database
                    $constraints = DB::select("
                        SELECT conname 
                        FROM pg_constraint 
                        WHERE conrelid = ?::regclass 
                        AND confrelid = 'groups'::regclass
                        AND contype = 'f'
                    ", [$tableName]);
                    
                    foreach ($constraints as $constraint) {
                        DB::statement("ALTER TABLE {$tableName} DROP CONSTRAINT IF EXISTS {$constraint->conname}");
                    }
                } catch (\Exception $e) {
                    // Continue if constraint doesn't exist
                }
            }
        }
    }

    private function switchGroupsPrimaryKey(): void
    {
        // Drop existing primary key
        DB::statement('ALTER TABLE groups DROP CONSTRAINT IF EXISTS groups_pkey');
        
        // Rename columns using raw SQL to avoid transaction issues
        DB::statement('ALTER TABLE groups RENAME COLUMN id TO old_id');
        DB::statement('ALTER TABLE groups RENAME COLUMN uuid TO id');
        
        // Set new primary key
        DB::statement('ALTER TABLE groups ADD PRIMARY KEY (id)');
    }

    private function updateReferencingTables(): void
    {
        $tables = ['group_has_ideascale_profile', 'group_has_proposal'];
        
        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'group_id')) {
                DB::statement("ALTER TABLE {$table} RENAME COLUMN group_id TO old_group_id");
                DB::statement("ALTER TABLE {$table} RENAME COLUMN group_uuid TO group_id");
            }
        }
    }

    private function updatePolymorphicReferences(): void
    {
        // Update polymorphic model_id to use UUID for Group references (model_id is now TEXT)
        DB::statement("
            UPDATE bookmark_items 
            SET model_id = temp_uuid_id::text 
            WHERE model_type = 'App\\\\\\\\Models\\\\\\\\Group' 
            AND temp_uuid_id IS NOT NULL
        ");
        
        DB::statement("
            UPDATE snapshots 
            SET model_id = temp_uuid_id::text 
            WHERE model_type = 'App\\\\\\\\Models\\\\\\\\Group' 
            AND temp_uuid_id IS NOT NULL
        ");
        
        DB::statement("
            UPDATE rankings 
            SET model_id = temp_uuid_id::text 
            WHERE model_type = 'App\\\\\\\\Models\\\\\\\\Group' 
            AND temp_uuid_id IS NOT NULL
        ");
        
        DB::statement("
            UPDATE txes 
            SET model_id = temp_uuid_id::text 
            WHERE model_type = 'App\\\\\\\\Models\\\\\\\\Group' 
            AND temp_uuid_id IS NOT NULL
        ");

        // Drop temporary columns
        $tables = ['bookmark_items', 'snapshots', 'rankings', 'txes'];
        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'temp_uuid_id')) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropColumn('temp_uuid_id');
                });
            }
        }
    }

    private function addForeignKeyConstraints(): void
    {
        $tables = ['group_has_ideascale_profile', 'group_has_proposal'];
        
        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'group_id')) {
                DB::statement("
                    ALTER TABLE {$table} 
                    ADD CONSTRAINT {$table}_group_id_foreign 
                    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
                ");
            }
        }
    }

    private function dropNewForeignKeyConstraints(): void
    {
        $tables = ['group_has_ideascale_profile', 'group_has_proposal'];
        
        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                try {
                    Schema::table($table, function (Blueprint $table) {
                        $table->dropForeign(['group_id']);
                    });
                } catch (\Exception $e) {
                    // Continue if constraint doesn't exist
                }
            }
        }
    }

    private function revertPolymorphicReferences(): void
    {
        // Add back temporary columns
        $tables = ['bookmark_items', 'snapshots', 'rankings', 'txes'];
        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    $table->uuid('temp_uuid_id')->nullable();
                });
                
                DB::statement("UPDATE {$table} SET temp_uuid_id = model_id::uuid WHERE model_type = 'App\\\\\\\\Models\\\\\\\\Group'");
            }
        }

        // Restore integer model_id from old_id
        DB::statement("
            UPDATE bookmark_items 
            SET model_id = groups.old_id::text
            FROM groups 
            WHERE bookmark_items.temp_uuid_id = groups.id 
            AND bookmark_items.model_type = 'App\\\\\\\\Models\\\\\\\\Group'
        ");
        
        DB::statement("
            UPDATE snapshots 
            SET model_id = groups.old_id::text
            FROM groups 
            WHERE snapshots.temp_uuid_id = groups.id 
            AND snapshots.model_type = 'App\\\\\\\\Models\\\\\\\\Group'
        ");
        
        DB::statement("
            UPDATE rankings 
            SET model_id = groups.old_id::text
            FROM groups 
            WHERE rankings.temp_uuid_id = groups.id 
            AND rankings.model_type = 'App\\\\\\\\Models\\\\\\\\Group'
        ");
        
        DB::statement("
            UPDATE txes 
            SET model_id = groups.old_id::text
            FROM groups 
            WHERE txes.temp_uuid_id = groups.id 
            AND txes.model_type = 'App\\\\\\\\Models\\\\\\\\Group'
        ");

        // Drop temporary columns
        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    $table->dropColumn('temp_uuid_id');
                });
            }
        }
    }

    private function revertGroupsPrimaryKey(): void
    {
        // Drop current primary key
        DB::statement('ALTER TABLE groups DROP CONSTRAINT IF EXISTS groups_pkey');
        
        // Rename columns back
        DB::statement('ALTER TABLE groups RENAME COLUMN id TO uuid');
        DB::statement('ALTER TABLE groups RENAME COLUMN old_id TO id');
        
        // Set old primary key
        DB::statement('ALTER TABLE groups ADD PRIMARY KEY (id)');
    }

    private function revertReferencingTables(): void
    {
        $tables = ['group_has_ideascale_profile', 'group_has_proposal'];
        
        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'group_id')) {
                DB::statement("ALTER TABLE {$table} RENAME COLUMN group_id TO group_uuid");
                DB::statement("ALTER TABLE {$table} RENAME COLUMN old_group_id TO group_id");
            }
        }
    }

    private function restoreOriginalForeignKeyConstraints(): void
    {
        $tables = ['group_has_ideascale_profile', 'group_has_proposal'];
        
        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'group_id')) {
                DB::statement("
                    ALTER TABLE {$table} 
                    ADD CONSTRAINT {$table}_group_id_foreign 
                    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
                ");
            }
        }
    }
};
