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
        DB::statement('ALTER TABLE registrations ADD COLUMN old_id BIGINT');

        // Copy current IDs to old_id column
        DB::statement('UPDATE registrations SET old_id = id');

        // Add new UUID column
        DB::statement('ALTER TABLE registrations ADD COLUMN new_id UUID DEFAULT gen_random_uuid()');

        // Populate new_id with UUIDs for all existing records
        DB::statement('UPDATE registrations SET new_id = gen_random_uuid() WHERE new_id IS NULL');

        // Update foreign key references in delegations table
        // First add temporary column for new registration_id
        DB::statement('ALTER TABLE delegations ADD COLUMN new_registration_id UUID');

        // Update delegations with new UUIDs
        DB::statement("
            UPDATE delegations 
            SET new_registration_id = registrations.new_id
            FROM registrations 
            WHERE delegations.registration_id = registrations.old_id
        ");

        // Drop old foreign key constraint
        DB::statement('ALTER TABLE delegations DROP CONSTRAINT IF EXISTS delegations_registration_id_foreign');

        // Drop old registration_id column and rename new one
        DB::statement('ALTER TABLE delegations DROP COLUMN registration_id');
        DB::statement('ALTER TABLE delegations RENAME COLUMN new_registration_id TO registration_id');
        DB::statement('ALTER TABLE delegations ALTER COLUMN registration_id SET NOT NULL');

        // Drop old primary key constraint on registrations
        DB::statement('ALTER TABLE registrations DROP CONSTRAINT registrations_pkey');

        // Drop the old id column
        DB::statement('ALTER TABLE registrations DROP COLUMN id');

        // Rename new_id to id
        DB::statement('ALTER TABLE registrations RENAME COLUMN new_id TO id');

        // Add primary key constraint on new UUID id
        DB::statement('ALTER TABLE registrations ADD PRIMARY KEY (id)');

        // Make id column NOT NULL
        DB::statement('ALTER TABLE registrations ALTER COLUMN id SET NOT NULL');

        // Re-add foreign key constraint with UUID
        DB::statement('ALTER TABLE delegations ADD CONSTRAINT delegations_registration_id_foreign FOREIGN KEY (registration_id) REFERENCES registrations(id)');

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        // Add back bigint id column
        DB::statement('ALTER TABLE registrations ADD COLUMN new_id BIGSERIAL');

        // Copy old_id back to new_id
        DB::statement('UPDATE registrations SET new_id = old_id');

        // Update delegations table back to bigint IDs
        DB::statement('ALTER TABLE delegations ADD COLUMN new_registration_id BIGINT');

        DB::statement("
            UPDATE delegations 
            SET new_registration_id = registrations.old_id
            FROM registrations 
            WHERE delegations.registration_id = registrations.id
        ");

        // Drop UUID foreign key constraint
        DB::statement('ALTER TABLE delegations DROP CONSTRAINT IF EXISTS delegations_registration_id_foreign');

        // Drop UUID registration_id column and rename new one
        DB::statement('ALTER TABLE delegations DROP COLUMN registration_id');
        DB::statement('ALTER TABLE delegations RENAME COLUMN new_registration_id TO registration_id');
        DB::statement('ALTER TABLE delegations ALTER COLUMN registration_id SET NOT NULL');

        // Drop UUID primary key
        DB::statement('ALTER TABLE registrations DROP CONSTRAINT registrations_pkey');

        // Drop UUID id column
        DB::statement('ALTER TABLE registrations DROP COLUMN id');

        // Rename new_id back to id
        DB::statement('ALTER TABLE registrations RENAME COLUMN new_id TO id');

        // Add back primary key constraint
        DB::statement('ALTER TABLE registrations ADD PRIMARY KEY (id)');

        // Drop old_id column
        DB::statement('ALTER TABLE registrations DROP COLUMN old_id');

        // Re-add foreign key constraint with bigint
        DB::statement('ALTER TABLE delegations ADD CONSTRAINT delegations_registration_id_foreign FOREIGN KEY (registration_id) REFERENCES registrations(id)');

        Schema::enableForeignKeyConstraints();
    }
};
