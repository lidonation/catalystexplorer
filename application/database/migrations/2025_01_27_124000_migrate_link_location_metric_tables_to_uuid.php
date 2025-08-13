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
        // PART 1: MIGRATE LINKS TABLE
        
        // Step 1: Add new UUID columns to links table
        Schema::table('links', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->bigInteger('old_id')->nullable()->after('uuid');
            
            // Add indexes for performance
            $table->index('uuid');
        });

        // Step 2: Generate UUIDs for existing links and backup old IDs
        DB::statement('UPDATE links SET uuid = gen_random_uuid(), old_id = id WHERE id IS NOT NULL');

        // Step 3: Make UUID columns non-nullable (if there are records)
        $linksCount = DB::scalar('SELECT COUNT(*) FROM links');
        if ($linksCount > 0) {
            Schema::table('links', function (Blueprint $table) {
                $table->uuid('uuid')->nullable(false)->change();
            });
        }

        // Step 4: Drop existing primary key and create new UUID primary key for links
        Schema::table('links', function (Blueprint $table) {
            $table->dropPrimary('links_pkey');
        });
        
        Schema::table('links', function (Blueprint $table) {
            $table->primary('uuid');
        });

        // Step 5: Drop old id column
        Schema::table('links', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        // Step 6: Rename UUID column to id
        Schema::table('links', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
        });

        // PART 2: MIGRATE LOCATIONS TABLE
        
        // Step 1: Add new UUID columns to locations table
        Schema::table('locations', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->bigInteger('old_id')->nullable()->after('uuid');
            
            // Add indexes for performance
            $table->index('uuid');
        });

        // Step 2: Generate UUIDs for existing locations and backup old IDs
        DB::statement('UPDATE locations SET uuid = gen_random_uuid(), old_id = id WHERE id IS NOT NULL');

        // Step 3: Update related tables to reference location UUIDs
        
        // Update model_has_locations table
        $modelHasLocationsCount = DB::scalar('SELECT COUNT(*) FROM model_has_locations WHERE location_id IS NOT NULL');
        if ($modelHasLocationsCount > 0) {
            Schema::table('model_has_locations', function (Blueprint $table) {
                $table->uuid('location_uuid')->nullable()->after('location_id');
                $table->index('location_uuid');
            });

            DB::statement("
                UPDATE model_has_locations 
                SET location_uuid = locations.uuid
                FROM locations 
                WHERE model_has_locations.location_id = locations.old_id
            ");

            Schema::table('model_has_locations', function (Blueprint $table) {
                $table->uuid('location_uuid')->nullable(false)->change();
            });
        }

        // Update users table
        $usersLocationCount = DB::scalar('SELECT COUNT(*) FROM users WHERE location_id IS NOT NULL');
        if ($usersLocationCount > 0) {
            Schema::table('users', function (Blueprint $table) {
                $table->uuid('location_uuid')->nullable()->after('location_id');
                $table->index('location_uuid');
            });

            DB::statement("
                UPDATE users 
                SET location_uuid = locations.uuid
                FROM locations 
                WHERE users.location_id = locations.old_id
            ");

            Schema::table('users', function (Blueprint $table) {
                $table->uuid('location_uuid')->nullable(false)->change();
            });
        }

        // Step 4: Make UUID columns non-nullable (if there are records)
        $locationsCount = DB::scalar('SELECT COUNT(*) FROM locations');
        if ($locationsCount > 0) {
            Schema::table('locations', function (Blueprint $table) {
                $table->uuid('uuid')->nullable(false)->change();
            });
        }

        // Step 5: Drop foreign key constraints first, then primary key, then create new UUID primary key
        
        // Drop foreign key constraints that depend on locations_pkey (regardless of data count)
        Schema::table('model_has_locations', function (Blueprint $table) {
            $table->dropForeign('model_has_locations_location_id_foreign');
        });
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign('users_location_id_foreign');
        });
        
        // Now drop the primary key
        Schema::table('locations', function (Blueprint $table) {
            $table->dropPrimary('locations_pkey');
        });
        
        // Create new UUID primary key
        Schema::table('locations', function (Blueprint $table) {
            $table->primary('uuid');
        });
        
        // Recreate foreign key constraints after renaming columns
        // (This will be done after column renaming)

        // Step 6: Drop old columns
        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        if ($modelHasLocationsCount > 0) {
            Schema::table('model_has_locations', function (Blueprint $table) {
                $table->dropColumn('location_id');
            });
        }

        if ($usersLocationCount > 0) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('location_id');
            });
        }

        // Step 7: Rename columns to final names
        Schema::table('locations', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
        });

        if ($modelHasLocationsCount > 0) {
            Schema::table('model_has_locations', function (Blueprint $table) {
                $table->renameColumn('location_uuid', 'location_id');
            });
        }

        if ($usersLocationCount > 0) {
            Schema::table('users', function (Blueprint $table) {
                $table->renameColumn('location_uuid', 'location_id');
            });
        }

        // PART 3: MIGRATE METRICS TABLE
        
        // Step 1: Add new UUID columns to metrics table
        Schema::table('metrics', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->bigInteger('old_id')->nullable()->after('uuid');
            $table->text('user_uuid')->nullable()->after('user_id');
            
            // Add indexes for performance
            $table->index('uuid');
            $table->index('user_uuid');
        });

        // Step 2: Generate UUIDs for existing metrics and backup old IDs
        DB::statement('UPDATE metrics SET uuid = gen_random_uuid(), old_id = id WHERE id IS NOT NULL');

        // Step 3: Convert user_id references from old bigint to UUIDs
        // Since users table still uses bigint IDs, we join on id directly
        DB::statement("
            UPDATE metrics 
            SET user_uuid = users.id::text
            FROM users 
            WHERE metrics.user_id = users.id
              AND metrics.user_id IS NOT NULL
        ");

        // Step 4: Make UUID columns non-nullable
        Schema::table('metrics', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
        });

        // Note: Keep user_uuid nullable as some metrics might not have users

        // Step 5: Drop existing primary key and create new UUID primary key for metrics
        Schema::table('metrics', function (Blueprint $table) {
            $table->dropPrimary('metrics_pkey');
        });
        
        Schema::table('metrics', function (Blueprint $table) {
            $table->primary('uuid');
        });

        // Step 6: Drop old columns
        Schema::table('metrics', function (Blueprint $table) {
            $table->dropColumn(['id', 'user_id']);
        });

        // Step 7: Rename columns to final names
        Schema::table('metrics', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
            $table->renameColumn('user_uuid', 'user_id');
        });

        // Step 8: Update indexes for renamed columns
        DB::statement('DROP INDEX IF EXISTS links_uuid_index');
        DB::statement('DROP INDEX IF EXISTS locations_uuid_index');
        DB::statement('DROP INDEX IF EXISTS metrics_uuid_index');
        DB::statement('DROP INDEX IF EXISTS metrics_user_uuid_index');

        if ($modelHasLocationsCount > 0) {
            DB::statement('DROP INDEX IF EXISTS model_has_locations_location_uuid_index');
            DB::statement('CREATE INDEX model_has_locations_location_id_index ON model_has_locations (location_id)');
        }

        if ($usersLocationCount > 0) {
            DB::statement('DROP INDEX IF EXISTS users_location_uuid_index');
            DB::statement('CREATE INDEX users_location_id_index ON users (location_id)');
        }

        DB::statement('CREATE INDEX links_id_index ON links (id)');
        DB::statement('CREATE INDEX locations_id_index ON locations (id)');
        DB::statement('CREATE INDEX metrics_id_index ON metrics (id)');
        DB::statement('CREATE INDEX metrics_user_id_index ON metrics (user_id)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a complex rollback - implement if needed
        throw new Exception('Migration rollback not implemented due to complexity. Use database backup if rollback needed.');
    }
};
