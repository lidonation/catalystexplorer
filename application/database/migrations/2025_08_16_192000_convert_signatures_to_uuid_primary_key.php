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

        // Check current table states to determine what needs to be done
        $signaturesOldIdExists = Schema::hasColumn('signatures', 'old_id');
        $signaturesHasUuidId = DB::select("SELECT data_type FROM information_schema.columns WHERE table_name = 'signatures' AND column_name = 'id'")[0]->data_type === 'uuid';
        
        $modelSigHasNewCols = Schema::hasColumn('model_signature', 'new_signature_id') || Schema::hasColumn('model_signature', 'new_model_id');
        $modelSigModelIdIsUuid = DB::select("SELECT data_type FROM information_schema.columns WHERE table_name = 'model_signature' AND column_name = 'model_id'")[0]->data_type === 'uuid';
        
        if (!$signaturesOldIdExists && !$signaturesHasUuidId) {
            // Fresh start - signatures table has bigint id, no old_id column
            $this->convertSignaturesTable();
            $this->convertModelSignatureTable();
        } elseif ($signaturesOldIdExists && $signaturesHasUuidId && !$modelSigModelIdIsUuid) {
            // Signatures table already converted, but model_signature needs work
            $this->convertModelSignatureTable();
        } elseif ($signaturesOldIdExists && $signaturesHasUuidId && $modelSigModelIdIsUuid) {
            // Both tables already converted, just ensure constraints are correct
            $this->ensureConstraints();
        } else {
            // Handle cleanup of partial states
            if ($modelSigHasNewCols) {
                $this->cleanupPartialModelSignatureConversion();
            }
        }

        Schema::enableForeignKeyConstraints();
    }
    
    private function convertSignaturesTable(): void
    {
        // First drop foreign key constraint that depends on the primary key
        DB::statement('ALTER TABLE model_signature DROP CONSTRAINT IF EXISTS model_signature_signature_id_foreign');
        
        // Add old_id column to store original bigint IDs for reference
        DB::statement('ALTER TABLE signatures ADD COLUMN old_id BIGINT');

        // Copy current IDs to old_id column
        DB::statement('UPDATE signatures SET old_id = id');

        // Add new UUID column
        DB::statement('ALTER TABLE signatures ADD COLUMN new_id UUID DEFAULT gen_random_uuid()');

        // Populate new_id with UUIDs for all existing records
        DB::statement('UPDATE signatures SET new_id = gen_random_uuid() WHERE new_id IS NULL');

        // Now we can drop old primary key constraint on signatures
        DB::statement('ALTER TABLE signatures DROP CONSTRAINT signatures_pkey');

        // Drop the old id column
        DB::statement('ALTER TABLE signatures DROP COLUMN id');

        // Rename new_id to id
        DB::statement('ALTER TABLE signatures RENAME COLUMN new_id TO id');

        // Add primary key constraint on new UUID id
        DB::statement('ALTER TABLE signatures ADD PRIMARY KEY (id)');

        // Make id column NOT NULL
        DB::statement('ALTER TABLE signatures ALTER COLUMN id SET NOT NULL');
    }
    
    private function convertModelSignatureTable(): void
    {
        // Drop existing foreign key constraint
        DB::statement('ALTER TABLE model_signature DROP CONSTRAINT IF EXISTS model_signature_signature_id_foreign');
        
        // Update foreign key references in model_signature table
        if (!Schema::hasColumn('model_signature', 'new_signature_id')) {
            DB::statement('ALTER TABLE model_signature ADD COLUMN new_signature_id UUID');
        }

        DB::statement("
            UPDATE model_signature 
            SET new_signature_id = signatures.id
            FROM signatures 
            WHERE model_signature.signature_id = signatures.old_id
        ");

        // Add temporary UUID column for model_id if not exists
        if (!Schema::hasColumn('model_signature', 'new_model_id')) {
            DB::statement('ALTER TABLE model_signature ADD COLUMN new_model_id UUID');
        }
        
        // Update model_id values to UUIDs by looking up in the referenced tables
        // For BookmarkCollection models
        $modelType = 'App\\Models\\BookmarkCollection';
        
        DB::statement('
            UPDATE model_signature 
            SET new_model_id = bookmark_collections.id
            FROM bookmark_collections 
            WHERE model_signature.model_type = ? 
            AND model_signature.model_id = bookmark_collections.old_id
        ', [$modelType]);
        
        // Remove orphaned records where model_id doesn't exist in referenced table
        DB::statement('
            DELETE FROM model_signature 
            WHERE model_signature.model_type = ?
            AND model_signature.new_model_id IS NULL
        ', [$modelType]);
        
        // Remove records where signature lookup failed
        DB::statement("
            DELETE FROM model_signature 
            WHERE model_signature.new_signature_id IS NULL
        ");
        
        // Check if we have any records left
        $recordCount = DB::select('SELECT COUNT(*) as count FROM model_signature')[0]->count;
        
        if ($recordCount > 0) {
            // Drop old columns and rename new ones
            DB::statement('ALTER TABLE model_signature DROP COLUMN signature_id');
            DB::statement('ALTER TABLE model_signature RENAME COLUMN new_signature_id TO signature_id');
            DB::statement('ALTER TABLE model_signature ALTER COLUMN signature_id SET NOT NULL');
            
            DB::statement('ALTER TABLE model_signature DROP COLUMN model_id');
            DB::statement('ALTER TABLE model_signature RENAME COLUMN new_model_id TO model_id');
            DB::statement('ALTER TABLE model_signature ALTER COLUMN model_id SET NOT NULL');
        } else {
            // If no records left, just clean up the columns
            DB::statement('ALTER TABLE model_signature DROP COLUMN signature_id');
            DB::statement('ALTER TABLE model_signature RENAME COLUMN new_signature_id TO signature_id');
            
            DB::statement('ALTER TABLE model_signature DROP COLUMN model_id');
            DB::statement('ALTER TABLE model_signature RENAME COLUMN new_model_id TO model_id');
        }
        
        // Re-add foreign key constraint with UUID
        DB::statement('ALTER TABLE model_signature ADD CONSTRAINT model_signature_signature_id_foreign FOREIGN KEY (signature_id) REFERENCES signatures(id) ON DELETE CASCADE');
    }
    
    private function cleanupPartialModelSignatureConversion(): void
    {
        // Clean up any partial conversion state
        if (Schema::hasColumn('model_signature', 'new_signature_id')) {
            DB::statement('ALTER TABLE model_signature DROP COLUMN new_signature_id');
        }
        if (Schema::hasColumn('model_signature', 'new_model_id')) {
            DB::statement('ALTER TABLE model_signature DROP COLUMN new_model_id');
        }
        
        // Now proceed with the conversion
        $this->convertModelSignatureTable();
    }
    
    private function ensureConstraints(): void
    {
        // Ensure foreign key constraint exists
        $hasConstraint = DB::select("
            SELECT COUNT(*) as count 
            FROM information_schema.table_constraints 
            WHERE table_name = 'model_signature' 
            AND constraint_name = 'model_signature_signature_id_foreign'
        ")[0]->count > 0;
        
        if (!$hasConstraint) {
            DB::statement('ALTER TABLE model_signature ADD CONSTRAINT model_signature_signature_id_foreign FOREIGN KEY (signature_id) REFERENCES signatures(id) ON DELETE CASCADE');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        // Add back bigint id column
        DB::statement('ALTER TABLE signatures ADD COLUMN new_id BIGSERIAL');

        // Copy old_id back to new_id
        DB::statement('UPDATE signatures SET new_id = old_id');

        // Update model_signature table back to bigint IDs
        DB::statement('ALTER TABLE model_signature ADD COLUMN new_signature_id BIGINT');

        DB::statement("
            UPDATE model_signature 
            SET new_signature_id = signatures.old_id
            FROM signatures 
            WHERE model_signature.signature_id = signatures.id
        ");

        // Revert model_id column back to bigint 
        // Note: This will fail if there are UUID values that can't be converted to bigint
        DB::statement('ALTER TABLE model_signature ALTER COLUMN model_id TYPE bigint USING model_id::text::bigint');

        // Drop UUID foreign key constraint
        DB::statement('ALTER TABLE model_signature DROP CONSTRAINT IF EXISTS model_signature_signature_id_foreign');

        // Drop UUID signature_id column and rename new one in model_signature
        DB::statement('ALTER TABLE model_signature DROP COLUMN signature_id');
        DB::statement('ALTER TABLE model_signature RENAME COLUMN new_signature_id TO signature_id');
        DB::statement('ALTER TABLE model_signature ALTER COLUMN signature_id SET NOT NULL');

        // Drop UUID primary key
        DB::statement('ALTER TABLE signatures DROP CONSTRAINT signatures_pkey');

        // Drop UUID id column
        DB::statement('ALTER TABLE signatures DROP COLUMN id');

        // Rename new_id back to id
        DB::statement('ALTER TABLE signatures RENAME COLUMN new_id TO id');

        // Add back primary key constraint
        DB::statement('ALTER TABLE signatures ADD PRIMARY KEY (id)');

        // Drop old_id column
        DB::statement('ALTER TABLE signatures DROP COLUMN old_id');

        // Re-add foreign key constraint with bigint
        DB::statement('ALTER TABLE model_signature ADD CONSTRAINT model_signature_signature_id_foreign FOREIGN KEY (signature_id) REFERENCES signatures(id) ON DELETE CASCADE');

        Schema::enableForeignKeyConstraints();
    }
};
