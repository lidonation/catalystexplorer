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
        // Tables with direct user_id foreign keys
        $tablesWithUserId = [
            'campaigns',
            'nfts' => ['user_id', 'artist_id'], // NFT has both user_id and artist_id
            'signatures',
            'txes',
            'rankings',
            'reviews',
            'bookmark_collections',
            'bookmark_items',
            'services',
            'community_has_users',
        ];

        // Tables with different column names referencing users
        $tablesWithCustomUserColumns = [
            'ideascale_profiles' => 'claimed_by_id',
        ];

        // Add user_uuid columns for standard user_id references
        foreach ($tablesWithUserId as $table => $columns) {
            if (is_string($columns)) {
                $table = $columns;
                $columns = ['user_id'];
            }

            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $blueprint) use ($columns) {
                    foreach ($columns as $column) {
                        if (Schema::hasColumn($blueprint->getTable(), $column)) {
                            $uuidColumn = str_replace('_id', '_uuid', $column);
                            $blueprint->uuid($uuidColumn)->nullable()->after($column);
                        }
                    }
                });
            }
        }

        // Add UUID columns for custom named user foreign keys
        foreach ($tablesWithCustomUserColumns as $table => $column) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, $column)) {
                Schema::table($table, function (Blueprint $blueprint) use ($column) {
                    $uuidColumn = str_replace('_id', '_uuid', $column);
                    $blueprint->uuid($uuidColumn)->nullable()->after($column);
                });
            }
        }

        // Backfill user_uuid columns for standard user_id references
        foreach ($tablesWithUserId as $table => $columns) {
            if (is_string($columns)) {
                $table = $columns;
                $columns = ['user_id'];
            }

            if (Schema::hasTable($table)) {
                foreach ($columns as $column) {
                    if (Schema::hasColumn($table, $column)) {
                        $uuidColumn = str_replace('_id', '_uuid', $column);
                        DB::statement("
                            UPDATE {$table} 
                            SET {$uuidColumn} = users.uuid 
                            FROM users 
                            WHERE {$table}.{$column}::text = users.id::text 
                            AND {$table}.{$column} IS NOT NULL
                        ");
                    }
                }
            }
        }

        // Backfill UUID columns for custom named user foreign keys
        foreach ($tablesWithCustomUserColumns as $table => $column) {
            if (Schema::hasTable($table)) {
                $uuidColumn = str_replace('_id', '_uuid', $column);
                DB::statement("
                    UPDATE {$table} 
                    SET {$uuidColumn} = users.uuid 
                    FROM users 
                    WHERE {$table}.{$column}::text = users.id::text 
                    AND {$table}.{$column} IS NOT NULL
                ");
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tablesWithUserId = [
            'campaigns',
            'nfts' => ['user_id', 'artist_id'],
            'signatures',
            'txes',
            'rankings',
            'reviews',
            'bookmark_collections',
            'bookmark_items',
            'services',
            'community_has_users',
        ];

        $tablesWithCustomUserColumns = [
            'ideascale_profiles' => 'claimed_by_id',
        ];

        // Drop UUID columns for standard user_id references
        foreach ($tablesWithUserId as $table => $columns) {
            if (is_string($columns)) {
                $table = $columns;
                $columns = ['user_id'];
            }

            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $blueprint) use ($columns) {
                    foreach ($columns as $column) {
                        $uuidColumn = str_replace('_id', '_uuid', $column);
                        if (Schema::hasColumn($blueprint->getTable(), $uuidColumn)) {
                            $blueprint->dropColumn($uuidColumn);
                        }
                    }
                });
            }
        }

        // Drop UUID columns for custom named user foreign keys
        foreach ($tablesWithCustomUserColumns as $table => $column) {
            if (Schema::hasTable($table)) {
                $uuidColumn = str_replace('_id', '_uuid', $column);
                if (Schema::hasColumn($table, $uuidColumn)) {
                    Schema::table($table, function (Blueprint $blueprint) use ($uuidColumn) {
                        $blueprint->dropColumn($uuidColumn);
                    });
                }
            }
        }
    }
};
