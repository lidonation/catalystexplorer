<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        // 1. Preserve old IDs
        DB::statement('ALTER TABLE categories ADD COLUMN old_id BIGINT');
        DB::statement('UPDATE categories SET old_id = id');

        // 2. Add new UUID id column
        DB::statement('ALTER TABLE categories ADD COLUMN new_id UUID DEFAULT gen_random_uuid()');
        DB::statement('UPDATE categories SET new_id = gen_random_uuid() WHERE new_id IS NULL');

        // 3. Add temporary UUID parent column
        DB::statement('ALTER TABLE categories ADD COLUMN new_parent_id UUID');

        // 4. Map old parent_id to new_parent_id
        DB::statement('UPDATE categories c SET new_parent_id = parent_c.new_id
                      FROM categories parent_c
                      WHERE c.parent_id = parent_c.old_id');

        // 5. Drop FK and PK constraints
        DB::statement('ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_parent_id_foreign');
        DB::statement('ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_pkey');

        // 6. Drop old id and parent_id
        DB::statement('ALTER TABLE categories DROP COLUMN id');
        DB::statement('ALTER TABLE categories DROP COLUMN parent_id');

        // 7. Rename new columns
        DB::statement('ALTER TABLE categories RENAME COLUMN new_id TO id');
        DB::statement('ALTER TABLE categories RENAME COLUMN new_parent_id TO parent_id');

        // 8. Set primary key
        DB::statement('ALTER TABLE categories ADD PRIMARY KEY (id)');

        // 9. Add FK on new UUID parent_id
        DB::statement('ALTER TABLE categories
            ADD CONSTRAINT categories_parent_id_foreign
            FOREIGN KEY (parent_id) REFERENCES categories(id)');

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        DB::statement('ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_parent_id_foreign');
        DB::statement('ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_pkey');

        DB::statement('ALTER TABLE categories DROP COLUMN id');
        DB::statement('ALTER TABLE categories DROP COLUMN parent_id');

        DB::statement('ALTER TABLE categories RENAME COLUMN old_id TO id');
        DB::statement('ALTER TABLE categories ADD PRIMARY KEY (id)');

        Schema::enableForeignKeyConstraints();
    }
};
