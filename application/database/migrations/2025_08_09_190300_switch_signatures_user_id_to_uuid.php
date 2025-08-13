<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('signatures')) {
            return;
        }

        // Determine users.id data type to decide migration path
        $usersIdType = null;
        try {
            $row = DB::selectOne("SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id'");
            $usersIdType = $row ? strtolower($row->data_type) : null;
        } catch (\Throwable $e) {
            $usersIdType = null;
        }

        // If users.id is not UUID, skip conversion to avoid FK type mismatch
        if ($usersIdType !== 'uuid') {
            // Ensure signatures.user_id remains a bigint and FK is intact if possible
            // Drop any temp column if present
            if (Schema::hasColumn('signatures', 'user_uuid')) {
                Schema::table('signatures', function (Blueprint $table) {
                    $table->dropColumn('user_uuid');
                });
            }

            // If user_id was previously altered, try to revert to bigint to match users.id
            if (Schema::hasColumn('signatures', 'user_id')) {
                // Best-effort: if user_id is not bigint, change it back to bigint
                try {
                    DB::statement("ALTER TABLE signatures ALTER COLUMN user_id TYPE bigint USING NULLIF(user_id::text, '')::bigint");
                } catch (\Throwable $e) {
                    // ignore if already bigint
                }
                // Try adding FK if missing
                try {
                    DB::statement('ALTER TABLE signatures ADD CONSTRAINT signatures_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
                } catch (\Throwable $e) {
                    // ignore if already exists or incompatible
                }
            }

            return; // Done for non-UUID users.id schema
        }

        // UUID path: convert signatures.user_id to UUID and relate to users(id)
        // 1) Add a temporary UUID column for user reference
        if (!Schema::hasColumn('signatures', 'user_uuid')) {
            Schema::table('signatures', function (Blueprint $table) {
                $table->uuid('user_uuid')->nullable()->after('user_id');
            });
        }

        // 2) Backfill from users.old_id (legacy bigint) to users.id (uuid) if old_id exists
        $usersHasOldId = Schema::hasColumn('users', 'old_id');
        if ($usersHasOldId) {
            DB::statement(
                "UPDATE signatures s
                 SET user_uuid = u.id
                 FROM users u
                 WHERE s.user_id IS NOT NULL
                   AND u.old_id IS NOT NULL
                   AND s.user_id::bigint = u.old_id"
            );
        }

        // 3) Drop existing FK constraint on user_id if present
        try {
            DB::statement('ALTER TABLE signatures DROP CONSTRAINT IF EXISTS signatures_user_id_foreign');
        } catch (\Throwable $e) {
            // ignore
        }

        // 4) Replace user_id column with UUID and move data from user_uuid
        if (Schema::hasColumn('signatures', 'user_id')) {
            try {
                Schema::table('signatures', function (Blueprint $table) {
                    $table->dropColumn('user_id');
                });
            } catch (\Throwable $e) {
                // ignore if already dropped
            }
        }

        Schema::table('signatures', function (Blueprint $table) {
            if (!Schema::hasColumn('signatures', 'user_id')) {
                $table->uuid('user_id')->nullable()->after('signature_key');
            }
        });

        // Move values over; any rows without mapping will remain NULL
        DB::statement('UPDATE signatures SET user_id = user_uuid WHERE user_uuid IS NOT NULL');

        // 5) Add FK to users(id)
        try {
            Schema::table('signatures', function (Blueprint $table) {
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        } catch (\Throwable $e) {
            // ignore if FK can't be added for some reason
        }

        // 6) Cleanup temp column
        if (Schema::hasColumn('signatures', 'user_uuid')) {
            Schema::table('signatures', function (Blueprint $table) {
                $table->dropColumn('user_uuid');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('signatures')) {
            return;
        }

        // Best-effort revert to bigint user_id (will null out non-numeric values)
        try { DB::statement('ALTER TABLE signatures DROP CONSTRAINT IF EXISTS signatures_user_id_foreign'); } catch (\Throwable $e) {}

        // Add a temp column to hold legacy numeric ids (if any)
        Schema::table('signatures', function (Blueprint $table) {
            $table->bigInteger('user_old_id')->nullable()->after('user_id');
        });

        DB::statement("UPDATE signatures SET user_old_id = NULL WHERE user_id IS NULL OR user_id !~ '^[0-9]+$'");
        DB::statement("UPDATE signatures SET user_old_id = user_id::bigint WHERE user_id ~ '^[0-9]+$'");

        Schema::table('signatures', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });

        Schema::table('signatures', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->after('signature_key');
        });

        DB::statement('UPDATE signatures SET user_id = user_old_id');

        Schema::table('signatures', function (Blueprint $table) {
            $table->dropColumn('user_old_id');
            // No FK recreated in down, as users may still be UUID-based
        });
    }
};

