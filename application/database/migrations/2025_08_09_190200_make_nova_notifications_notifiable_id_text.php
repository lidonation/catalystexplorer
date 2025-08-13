<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('nova_notifications')) {
            return;
        }

        // Drop any indexes that might conflict during type change
        try { DB::statement('DROP INDEX IF EXISTS nova_notifications_notifiable_type_notifiable_id_index'); } catch (\Throwable $e) {}
        try { DB::statement('DROP INDEX IF EXISTS notifiable_type_notifiable_id_index'); } catch (\Throwable $e) {}

        // Change notifiable_id to text so it can store integer IDs or UUIDs as strings
        DB::statement('ALTER TABLE nova_notifications ALTER COLUMN notifiable_id TYPE text USING notifiable_id::text');

        // Recreate the composite index for performance
        Schema::table('nova_notifications', function (Blueprint $table) {
            $table->index(['notifiable_type', 'notifiable_id']);
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('nova_notifications')) {
            return;
        }

        // Best-effort revert: convert numeric-only values back to bigint
        try { DB::statement('DROP INDEX IF EXISTS nova_notifications_notifiable_type_notifiable_id_index'); } catch (\Throwable $e) {}
        DB::statement("UPDATE nova_notifications SET notifiable_id = NULL WHERE notifiable_id !~ '^[0-9]+$'");
        DB::statement('ALTER TABLE nova_notifications ALTER COLUMN notifiable_id TYPE bigint USING notifiable_id::bigint');
        Schema::table('nova_notifications', function (Blueprint $table) {
            $table->index(['notifiable_type', 'notifiable_id']);
        });
    }
};

