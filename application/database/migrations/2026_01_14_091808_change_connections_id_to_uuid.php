<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
  
    public function up(): void
    {
        DB::table('connections')->truncate();

        DB::statement('ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_pkey');

        DB::statement('ALTER TABLE connections ALTER COLUMN id DROP DEFAULT');

        DB::statement('DROP SEQUENCE IF EXISTS connections_id_seq CASCADE');

        DB::statement('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

        DB::statement('ALTER TABLE connections ALTER COLUMN id TYPE uuid USING gen_random_uuid()');

        DB::statement('ALTER TABLE connections ALTER COLUMN id SET DEFAULT gen_random_uuid()');

        DB::statement('ALTER TABLE connections ADD PRIMARY KEY (id)');

        DB::statement('CREATE INDEX IF NOT EXISTS connections_previous_model_idx ON connections (previous_model_type, previous_model_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS connections_next_model_idx ON connections (next_model_type, next_model_id)');
    }

    public function down(): void
    {
        DB::table('connections')->truncate();

        DB::statement('ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_pkey');

        DB::statement('ALTER TABLE connections ALTER COLUMN id DROP DEFAULT');

        DB::statement('ALTER TABLE connections ALTER COLUMN id TYPE bigint USING 0');

        DB::statement('CREATE SEQUENCE IF NOT EXISTS connections_id_seq');

        DB::statement("ALTER TABLE connections ALTER COLUMN id SET DEFAULT nextval('connections_id_seq')");

        DB::statement('ALTER TABLE connections ADD PRIMARY KEY (id)');

        DB::statement('ALTER SEQUENCE connections_id_seq OWNED BY connections.id');

        DB::statement('DROP INDEX IF EXISTS connections_previous_model_idx');
        DB::statement('DROP INDEX IF EXISTS connections_next_model_idx');
    }
};
