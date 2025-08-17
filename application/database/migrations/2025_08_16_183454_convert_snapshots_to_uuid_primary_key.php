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
        DB::statement('ALTER TABLE snapshots ADD COLUMN old_id BIGINT');

        // Copy current IDs to old_id column
        DB::statement('UPDATE snapshots SET old_id = id');

        // Add new UUID column
        DB::statement('ALTER TABLE snapshots ADD COLUMN new_id UUID DEFAULT gen_random_uuid()');

        // Populate new_id with UUIDs for all existing records
        DB::statement('UPDATE snapshots SET new_id = gen_random_uuid() WHERE new_id IS NULL');

        // Update foreign key references in voter_histories table
        DB::statement('ALTER TABLE voter_histories ADD COLUMN new_snapshot_id UUID');

        DB::statement("
            UPDATE voter_histories 
            SET new_snapshot_id = snapshots.new_id
            FROM snapshots 
            WHERE voter_histories.snapshot_id = snapshots.old_id
        ");

        // Drop old snapshot_id column and rename new one in voter_histories
        DB::statement('ALTER TABLE voter_histories DROP COLUMN snapshot_id');
        DB::statement('ALTER TABLE voter_histories RENAME COLUMN new_snapshot_id TO snapshot_id');

        // Update foreign key references in voting_powers table
        DB::statement('ALTER TABLE voting_powers ADD COLUMN new_snapshot_id UUID');

        DB::statement("
            UPDATE voting_powers 
            SET new_snapshot_id = snapshots.new_id
            FROM snapshots 
            WHERE voting_powers.snapshot_id = snapshots.old_id
        ");

        // Drop old foreign key constraint
        DB::statement('ALTER TABLE voting_powers DROP CONSTRAINT IF EXISTS voting_powers_snapshot_id_foreign');

        // Drop old snapshot_id column and rename new one in voting_powers
        DB::statement('ALTER TABLE voting_powers DROP COLUMN snapshot_id');
        DB::statement('ALTER TABLE voting_powers RENAME COLUMN new_snapshot_id TO snapshot_id');
        DB::statement('ALTER TABLE voting_powers ALTER COLUMN snapshot_id SET NOT NULL');

        // Drop old primary key constraint on snapshots
        DB::statement('ALTER TABLE snapshots DROP CONSTRAINT snapshots_pkey');

        // Drop the old id column
        DB::statement('ALTER TABLE snapshots DROP COLUMN id');

        // Rename new_id to id
        DB::statement('ALTER TABLE snapshots RENAME COLUMN new_id TO id');

        // Add primary key constraint on new UUID id
        DB::statement('ALTER TABLE snapshots ADD PRIMARY KEY (id)');

        // Make id column NOT NULL
        DB::statement('ALTER TABLE snapshots ALTER COLUMN id SET NOT NULL');

        // Re-add foreign key constraint with UUID
        DB::statement('ALTER TABLE voting_powers ADD CONSTRAINT voting_powers_snapshot_id_foreign FOREIGN KEY (snapshot_id) REFERENCES snapshots(id) ON DELETE CASCADE');

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        // Add back bigint id column
        DB::statement('ALTER TABLE snapshots ADD COLUMN new_id BIGSERIAL');

        // Copy old_id back to new_id
        DB::statement('UPDATE snapshots SET new_id = old_id');

        // Update voter_histories table back to bigint IDs
        DB::statement('ALTER TABLE voter_histories ADD COLUMN new_snapshot_id BIGINT');

        DB::statement("
            UPDATE voter_histories 
            SET new_snapshot_id = snapshots.old_id
            FROM snapshots 
            WHERE voter_histories.snapshot_id = snapshots.id
        ");

        // Drop UUID snapshot_id column and rename new one in voter_histories
        DB::statement('ALTER TABLE voter_histories DROP COLUMN snapshot_id');
        DB::statement('ALTER TABLE voter_histories RENAME COLUMN new_snapshot_id TO snapshot_id');

        // Update voting_powers table back to bigint IDs
        DB::statement('ALTER TABLE voting_powers ADD COLUMN new_snapshot_id BIGINT');

        DB::statement("
            UPDATE voting_powers 
            SET new_snapshot_id = snapshots.old_id
            FROM snapshots 
            WHERE voting_powers.snapshot_id = snapshots.id
        ");

        // Drop UUID foreign key constraint
        DB::statement('ALTER TABLE voting_powers DROP CONSTRAINT IF EXISTS voting_powers_snapshot_id_foreign');

        // Drop UUID snapshot_id column and rename new one in voting_powers
        DB::statement('ALTER TABLE voting_powers DROP COLUMN snapshot_id');
        DB::statement('ALTER TABLE voting_powers RENAME COLUMN new_snapshot_id TO snapshot_id');
        DB::statement('ALTER TABLE voting_powers ALTER COLUMN snapshot_id SET NOT NULL');

        // Drop UUID primary key
        DB::statement('ALTER TABLE snapshots DROP CONSTRAINT snapshots_pkey');

        // Drop UUID id column
        DB::statement('ALTER TABLE snapshots DROP COLUMN id');

        // Rename new_id back to id
        DB::statement('ALTER TABLE snapshots RENAME COLUMN new_id TO id');

        // Add back primary key constraint
        DB::statement('ALTER TABLE snapshots ADD PRIMARY KEY (id)');

        // Drop old_id column
        DB::statement('ALTER TABLE snapshots DROP COLUMN old_id');

        // Re-add foreign key constraint with bigint
        DB::statement('ALTER TABLE voting_powers ADD CONSTRAINT voting_powers_snapshot_id_foreign FOREIGN KEY (snapshot_id) REFERENCES snapshots(id) ON DELETE CASCADE');

        Schema::enableForeignKeyConstraints();
    }
};
