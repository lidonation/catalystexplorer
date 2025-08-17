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
        DB::statement('ALTER TABLE signatures ADD COLUMN old_id BIGINT');

        // Copy current IDs to old_id column
        DB::statement('UPDATE signatures SET old_id = id');

        // Add new UUID column
        DB::statement('ALTER TABLE signatures ADD COLUMN new_id UUID DEFAULT gen_random_uuid()');

        // Populate new_id with UUIDs for all existing records
        DB::statement('UPDATE signatures SET new_id = gen_random_uuid() WHERE new_id IS NULL');

        // Update foreign key references in model_signature table
        DB::statement('ALTER TABLE model_signature ADD COLUMN new_signature_id UUID');

        DB::statement("
            UPDATE model_signature 
            SET new_signature_id = signatures.new_id
            FROM signatures 
            WHERE model_signature.signature_id = signatures.old_id
        ");

        // Convert model_id column to UUID
        DB::statement('ALTER TABLE model_signature ALTER COLUMN model_id TYPE UUID USING model_id::text::UUID');

        // Drop old foreign key constraint
        DB::statement('ALTER TABLE model_signature DROP CONSTRAINT IF EXISTS model_signature_signature_id_foreign');

        // Drop old signature_id column and rename new one in model_signature
        DB::statement('ALTER TABLE model_signature DROP COLUMN signature_id');
        DB::statement('ALTER TABLE model_signature RENAME COLUMN new_signature_id TO signature_id');
        DB::statement('ALTER TABLE model_signature ALTER COLUMN signature_id SET NOT NULL');

        // Drop old primary key constraint on signatures
        DB::statement('ALTER TABLE signatures DROP CONSTRAINT signatures_pkey');

        // Drop the old id column
        DB::statement('ALTER TABLE signatures DROP COLUMN id');

        // Rename new_id to id
        DB::statement('ALTER TABLE signatures RENAME COLUMN new_id TO id');

        // Add primary key constraint on new UUID id
        DB::statement('ALTER TABLE signatures ADD PRIMARY KEY (id)');

        // Make id column NOT NULL
        DB::statement('ALTER TABLE signatures ALTER COLUMN id SET NOT NULL');

        // Re-add foreign key constraint with UUID
        DB::statement('ALTER TABLE model_signature ADD CONSTRAINT model_signature_signature_id_foreign FOREIGN KEY (signature_id) REFERENCES signatures(id) ON DELETE CASCADE');

        Schema::enableForeignKeyConstraints();
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
