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
        DB::transaction(function () {
            // Step 1: Add a temporary UUID column
            Schema::table('discussions', function (Blueprint $table) {
                $table->text('user_uuid')->nullable()->after('user_id');
            });

            // Step 2: Map numeric user_ids to UUIDs using users.old_id
            DB::statement("
                UPDATE discussions 
                SET user_uuid = u.id::text
                FROM users u 
                WHERE discussions.user_id = u.old_id
                AND discussions.user_id IS NOT NULL
            ");

            // Step 3: Check how many user_ids were successfully mapped
            $mappedCount = DB::table('discussions')
                ->whereNotNull('user_id')
                ->whereNotNull('user_uuid')
                ->count();

            $unmappedCount = DB::table('discussions')
                ->whereNotNull('user_id')
                ->whereNull('user_uuid')
                ->count();

            echo "Mapped $mappedCount user_ids to UUIDs\n";
            
            if ($unmappedCount > 0) {
                echo "Warning: $unmappedCount user_ids could not be mapped - removing these discussions\n";
                
                // Remove discussions with unmappable user_ids
                DB::table('discussions')
                    ->whereNotNull('user_id')
                    ->whereNull('user_uuid')
                    ->delete();
            }

            // Step 4: Drop the old bigint user_id column and rename user_uuid to user_id
            Schema::table('discussions', function (Blueprint $table) {
                $table->dropColumn('user_id');
            });

            Schema::table('discussions', function (Blueprint $table) {
                $table->renameColumn('user_uuid', 'user_id');
            });

            // Step 5: Convert the new user_id column from text to UUID type
            DB::statement('ALTER TABLE discussions ALTER COLUMN user_id TYPE UUID USING user_id::UUID');

            // Step 6: Verify the migration
            $finalCount = DB::table('discussions')->whereNotNull('user_id')->count();
            echo "Final discussions with user_id: $finalCount\n";

            echo "Successfully migrated discussions.user_id to UUID\n";
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::transaction(function () {
            // Step 1: Add temporary bigint column
            Schema::table('discussions', function (Blueprint $table) {
                $table->bigInteger('user_id_old')->nullable()->after('user_id');
            });

            // Step 2: Map UUIDs back to old_ids
            DB::statement("
                UPDATE discussions 
                SET user_id_old = u.old_id
                FROM users u 
                WHERE discussions.user_id::text = u.id::text
                AND discussions.user_id IS NOT NULL
            ");

            // Step 3: Drop UUID column and rename old column back
            Schema::table('discussions', function (Blueprint $table) {
                $table->dropColumn('user_id');
            });

            Schema::table('discussions', function (Blueprint $table) {
                $table->renameColumn('user_id_old', 'user_id');
            });

            echo "Reverted discussions.user_id back to bigint old_ids\n";
        });
    }
};
