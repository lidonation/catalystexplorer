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
            $this->switchFundsPrimaryKey();
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
            $this->revertFundsPrimaryKey();
        });

        DB::transaction(function () {
            $this->restoreOriginalForeignKeyConstraints();
        });
    }

    private function dropForeignKeyConstraints(): void
    {
        $tables = ['campaigns', 'proposals', 'milestones', 'proposal_milestones', 'bookmark_collections'];
        
        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'fund_id')) {
                try {
                    // Get actual constraint name from database
                    $constraints = DB::select("
                        SELECT conname 
                        FROM pg_constraint 
                        WHERE conrelid = ?::regclass 
                        AND confrelid = 'funds'::regclass
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
        
        // Drop parent_id constraint in funds table
        try {
            $constraints = DB::select("
                SELECT conname 
                FROM pg_constraint 
                WHERE conrelid = 'funds'::regclass 
                AND confrelid = 'funds'::regclass
                AND contype = 'f'
                AND conname LIKE '%parent_id%'
            ");
            
            foreach ($constraints as $constraint) {
                DB::statement("ALTER TABLE funds DROP CONSTRAINT IF EXISTS {$constraint->conname}");
            }
        } catch (\Exception $e) {
            // Continue if constraint doesn't exist
        }
    }

    private function switchFundsPrimaryKey(): void
    {
        // Drop existing primary key
        DB::statement('ALTER TABLE funds DROP CONSTRAINT IF EXISTS funds_pkey');
        
        // Rename columns using raw SQL to avoid transaction issues
        DB::statement('ALTER TABLE funds RENAME COLUMN id TO old_id');
        DB::statement('ALTER TABLE funds RENAME COLUMN uuid TO id');
        DB::statement('ALTER TABLE funds RENAME COLUMN parent_id TO old_parent_id');
        DB::statement('ALTER TABLE funds RENAME COLUMN parent_uuid TO parent_id');
        
        // Set new primary key
        DB::statement('ALTER TABLE funds ADD PRIMARY KEY (id)');
    }

    private function updateReferencingTables(): void
    {
        $tables = ['proposals', 'campaigns', 'milestones', 'proposal_milestones', 'bookmark_collections'];
        
        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'fund_id')) {
                DB::statement("ALTER TABLE {$table} RENAME COLUMN fund_id TO old_fund_id");
                DB::statement("ALTER TABLE {$table} RENAME COLUMN fund_uuid TO fund_id");
            }
        }
    }

    private function updatePolymorphicReferences(): void
    {
        // Update polymorphic model_id to use UUID for Fund references (model_id is now TEXT)
        DB::statement("
            UPDATE snapshots 
            SET model_id = temp_uuid_id::text 
            WHERE model_type = 'App\\\\Models\\\\Fund' 
            AND temp_uuid_id IS NOT NULL
        ");
        
        DB::statement("
            UPDATE rankings 
            SET model_id = temp_uuid_id::text 
            WHERE model_type = 'App\\\\Models\\\\Fund' 
            AND temp_uuid_id IS NOT NULL
        ");
        
        DB::statement("
            UPDATE txes 
            SET model_id = temp_uuid_id::text 
            WHERE model_type = 'App\\\\Models\\\\Fund' 
            AND temp_uuid_id IS NOT NULL
        ");

        // Drop temporary columns
        $tables = ['snapshots', 'rankings', 'txes'];
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
        $tables = ['proposals', 'campaigns', 'milestones', 'proposal_milestones', 'bookmark_collections'];
        
        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'fund_id')) {
                DB::statement("
                    ALTER TABLE {$table} 
                    ADD CONSTRAINT {$table}_fund_id_foreign 
                    FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE SET NULL
                ");
            }
        }
        
        // Add parent_id constraint
        DB::statement("
            ALTER TABLE funds 
            ADD CONSTRAINT funds_parent_id_foreign 
            FOREIGN KEY (parent_id) REFERENCES funds(id) ON DELETE CASCADE
        ");
    }

    private function dropNewForeignKeyConstraints(): void
    {
        $tables = ['proposals', 'campaigns', 'milestones', 'proposal_milestones', 'bookmark_collections'];
        
        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                try {
                    Schema::table($table, function (Blueprint $table) {
                        $table->dropForeign(['fund_id']);
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
        $tables = ['snapshots', 'rankings', 'txes'];
        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $table) {
                    $table->uuid('temp_uuid_id')->nullable();
                });
                
                DB::statement("UPDATE {$table} SET temp_uuid_id = model_id::uuid WHERE model_type = 'App\\\\Models\\\\Fund'");
            }
        }

        // Restore integer model_id from old_id
        DB::statement("
            UPDATE snapshots 
            SET model_id = funds.old_id::text
            FROM funds 
            WHERE snapshots.temp_uuid_id = funds.id 
            AND snapshots.model_type = 'App\\\\Models\\\\Fund'
        ");
        
        DB::statement("
            UPDATE rankings 
            SET model_id = funds.old_id::text
            FROM funds 
            WHERE rankings.temp_uuid_id = funds.id 
            AND rankings.model_type = 'App\\\\Models\\\\Fund'
        ");
        
        DB::statement("
            UPDATE txes 
            SET model_id = funds.old_id::text
            FROM funds 
            WHERE txes.temp_uuid_id = funds.id 
            AND txes.model_type = 'App\\\\Models\\\\Fund'
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

    private function revertFundsPrimaryKey(): void
    {
        // Drop parent_id foreign key
        DB::statement('ALTER TABLE funds DROP CONSTRAINT IF EXISTS funds_parent_id_foreign');
        
        // Drop current primary key
        DB::statement('ALTER TABLE funds DROP CONSTRAINT IF EXISTS funds_pkey');
        
        // Rename columns back
        DB::statement('ALTER TABLE funds RENAME COLUMN id TO uuid');
        DB::statement('ALTER TABLE funds RENAME COLUMN old_id TO id');
        DB::statement('ALTER TABLE funds RENAME COLUMN parent_id TO parent_uuid');
        DB::statement('ALTER TABLE funds RENAME COLUMN old_parent_id TO parent_id');
        
        // Set old primary key
        DB::statement('ALTER TABLE funds ADD PRIMARY KEY (id)');
    }

    private function revertReferencingTables(): void
    {
        $tables = ['proposals', 'campaigns', 'milestones', 'proposal_milestones', 'bookmark_collections'];
        
        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'fund_id')) {
                DB::statement("ALTER TABLE {$table} RENAME COLUMN fund_id TO fund_uuid");
                DB::statement("ALTER TABLE {$table} RENAME COLUMN old_fund_id TO fund_id");
            }
        }
    }

    private function restoreOriginalForeignKeyConstraints(): void
    {
        $tables = ['proposals', 'campaigns', 'milestones', 'proposal_milestones', 'bookmark_collections'];
        
        foreach ($tables as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'fund_id')) {
                DB::statement("
                    ALTER TABLE {$table} 
                    ADD CONSTRAINT {$table}_fund_id_foreign 
                    FOREIGN KEY (fund_id) REFERENCES funds(id) ON DELETE SET NULL
                ");
            }
        }

        DB::statement("
            ALTER TABLE funds 
            ADD CONSTRAINT funds_parent_id_foreign 
            FOREIGN KEY (parent_id) REFERENCES funds(id) ON DELETE CASCADE
        ");
    }
};
