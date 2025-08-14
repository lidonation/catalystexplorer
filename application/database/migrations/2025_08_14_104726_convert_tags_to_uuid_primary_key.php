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
        
        // Add old_id column to store original bigint IDs for reference
        DB::statement('ALTER TABLE tags ADD COLUMN old_id BIGINT');
        
        // Copy current IDs to old_id column
        DB::statement('UPDATE tags SET old_id = id');
        
        // Add new UUID column
        DB::statement('ALTER TABLE tags ADD COLUMN new_id UUID DEFAULT gen_random_uuid()');
        
        // Populate new_id with UUIDs for all existing records
        DB::statement('UPDATE tags SET new_id = gen_random_uuid() WHERE new_id IS NULL');
        
        // Update media table to use UUID for Tag models
        DB::statement("
            UPDATE media 
            SET model_id = tags.new_id
            FROM tags 
            WHERE media.model_type = 'App\\Models\\Tag' 
            AND media.model_id::text = tags.old_id::text
        ");
        
        // Update model_tag pivot table if it references tags
        if (Schema::hasTable('model_tag')) {
            // First change the column type to text temporarily
            DB::statement('ALTER TABLE model_tag ALTER COLUMN tag_id TYPE TEXT USING tag_id::TEXT');
            
            // Update the values with UUID strings
            DB::statement("
                UPDATE model_tag 
                SET tag_id = tags.new_id::text
                FROM tags 
                WHERE model_tag.tag_id = tags.old_id::text
            ");
            
            // Finally change tag_id column type to UUID
            DB::statement('ALTER TABLE model_tag ALTER COLUMN tag_id TYPE UUID USING tag_id::UUID');
        }
        
        // Drop old primary key constraint
        DB::statement('ALTER TABLE tags DROP CONSTRAINT tags_pkey');
        
        // Drop the old id column
        DB::statement('ALTER TABLE tags DROP COLUMN id');
        
        // Rename new_id to id
        DB::statement('ALTER TABLE tags RENAME COLUMN new_id TO id');
        
        // Add primary key constraint on new UUID id
        DB::statement('ALTER TABLE tags ADD PRIMARY KEY (id)');
        
        // Make id column NOT NULL
        DB::statement('ALTER TABLE tags ALTER COLUMN id SET NOT NULL');
        
        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        
        // Add back bigint id column
        DB::statement('ALTER TABLE tags ADD COLUMN new_id BIGSERIAL');
        
        // Copy old_id back to new_id
        DB::statement('UPDATE tags SET new_id = old_id');
        
        // Update media table back to bigint IDs
        DB::statement("
            UPDATE media 
            SET model_id = tags.old_id::text
            FROM tags 
            WHERE media.model_type = 'App\\Models\\Tag' 
            AND media.model_id = tags.id::text
        ");
        
        // Update model_tag pivot table back
        if (Schema::hasTable('model_tag')) {
            DB::statement("
                UPDATE model_tag 
                SET tag_id = tags.old_id::text
                FROM tags 
                WHERE model_tag.tag_id = tags.id::text
            ");
            
            // Change tag_id column type back to bigint
            DB::statement('ALTER TABLE model_tag ALTER COLUMN tag_id TYPE BIGINT USING tag_id::BIGINT');
        }
        
        // Drop UUID primary key
        DB::statement('ALTER TABLE tags DROP CONSTRAINT tags_pkey');
        
        // Drop UUID id column
        DB::statement('ALTER TABLE tags DROP COLUMN id');
        
        // Rename new_id back to id
        DB::statement('ALTER TABLE tags RENAME COLUMN new_id TO id');
        
        // Add back primary key constraint
        DB::statement('ALTER TABLE tags ADD PRIMARY KEY (id)');
        
        // Drop old_id column
        DB::statement('ALTER TABLE tags DROP COLUMN old_id');
        
        Schema::enableForeignKeyConstraints();
    }
};
