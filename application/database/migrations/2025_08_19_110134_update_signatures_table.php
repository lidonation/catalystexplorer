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
        Schema::disableForeignKeyConstraints();
        
        // Check if user_id column exists and what type it is
        $userIdColumn = DB::select(
            "SELECT data_type, is_nullable 
             FROM information_schema.columns 
             WHERE table_name = 'signatures' AND column_name = 'user_id'"
        );
        
        if (empty($userIdColumn)) {
            // user_id column doesn't exist, create it as UUID
            Schema::table('signatures', function (Blueprint $table) {
                $table->uuid('user_id')->nullable()->after('id');
                $table->index('user_id');
            });
        } else {
            $currentType = $userIdColumn[0]->data_type;
            
            // If user_id is not already UUID, convert it
            if ($currentType !== 'uuid') {
                $this->convertUserIdToUuid();
            }
        }
        
        // If user_uuid column exists, consolidate the data
        if (Schema::hasColumn('signatures', 'user_uuid')) {
            $this->consolidateUserColumns();
        }
        
        // Add foreign key constraint if it doesn't exist
        $this->ensureForeignKeyConstraint();
        
        Schema::enableForeignKeyConstraints();
    }
    
    /**
     * Convert user_id column from integer/bigint to UUID
     */
    private function convertUserIdToUuid(): void
    {
        // Step 1: Add temporary UUID column
        DB::statement('ALTER TABLE signatures ADD COLUMN temp_user_id UUID');
        
        // Step 2: Update temp_user_id with UUIDs from users table where user_id matches
        DB::statement("
            UPDATE signatures 
            SET temp_user_id = users.id 
            FROM users 
            WHERE signatures.user_id::text = users.old_id::text
            AND signatures.user_id IS NOT NULL
        ");
        
        // Step 3: Drop the old user_id column
        DB::statement('ALTER TABLE signatures DROP COLUMN user_id');
        
        // Step 4: Rename temp_user_id to user_id
        DB::statement('ALTER TABLE signatures RENAME COLUMN temp_user_id TO user_id');
        
        // Step 5: Add index on the new user_id column
        DB::statement('CREATE INDEX signatures_user_id_index ON signatures(user_id)');
    }
    
    /**
     * Consolidate user_id and user_uuid columns
     */
    private function consolidateUserColumns(): void
    {
        // Update user_id with user_uuid values where user_id is null but user_uuid exists
        DB::statement("
            UPDATE signatures 
            SET user_id = user_uuid 
            WHERE user_id IS NULL 
            AND user_uuid IS NOT NULL
        ");
        
        // Update user_uuid with user_id values where user_uuid is null but user_id exists
        DB::statement("
            UPDATE signatures 
            SET user_uuid = user_id 
            WHERE user_uuid IS NULL 
            AND user_id IS NOT NULL
        ");
        
        // Drop the user_uuid column since we now have user_id as UUID
        Schema::table('signatures', function (Blueprint $table) {
            $table->dropColumn('user_uuid');
        });
    }
    
    /**
     * Ensure foreign key constraint exists
     */
    private function ensureForeignKeyConstraint(): void
    {
        // Check if foreign key constraint already exists
        $hasConstraint = DB::select("
            SELECT COUNT(*) as count 
            FROM information_schema.table_constraints 
            WHERE table_name = 'signatures' 
            AND constraint_name = 'signatures_user_id_foreign'
        ")[0]->count > 0;
        
        if (!$hasConstraint) {
            DB::statement(
                'ALTER TABLE signatures 
                 ADD CONSTRAINT signatures_user_id_foreign 
                 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL'
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        
        // Drop foreign key constraint
        DB::statement('ALTER TABLE signatures DROP CONSTRAINT IF EXISTS signatures_user_id_foreign');
        
        // Add back user_uuid column
        Schema::table('signatures', function (Blueprint $table) {
            $table->uuid('user_uuid')->nullable()->after('user_id');
        });
        
        // Copy user_id values to user_uuid
        DB::statement('UPDATE signatures SET user_uuid = user_id WHERE user_id IS NOT NULL');
        
        // Convert user_id back to bigint (this will lose data if there are UUID values that can't be converted)
        DB::statement('ALTER TABLE signatures ADD COLUMN temp_user_id BIGINT');
        
        // Try to convert UUID back to bigint using old_id from users table
        DB::statement("
            UPDATE signatures 
            SET temp_user_id = users.old_id 
            FROM users 
            WHERE signatures.user_id = users.id
        ");
        
        // Drop UUID user_id column and rename temp column
        DB::statement('ALTER TABLE signatures DROP COLUMN user_id');
        DB::statement('ALTER TABLE signatures RENAME COLUMN temp_user_id TO user_id');
        
        Schema::enableForeignKeyConstraints();
    }
};
