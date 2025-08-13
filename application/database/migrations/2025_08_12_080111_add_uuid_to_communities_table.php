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
        // Add new UUID columns to communities table
        Schema::table('communities', function (Blueprint $table) {
            $table->uuid('uuid_id')->nullable()->after('id');
            $table->uuid('user_uuid')->nullable()->after('user_id');
            $table->bigInteger('old_id')->nullable()->after('uuid_id');
        });

        // Generate UUIDs for existing communities
        DB::table('communities')->whereNull('uuid_id')->update([
            'uuid_id' => DB::raw('gen_random_uuid()'),
            'old_id' => DB::raw('id')
        ]);

        // Convert user_id references to UUIDs
        $userUpdates = DB::select("
            SELECT c.id, u.id as user_uuid 
            FROM communities c
            JOIN users u ON u.old_id = c.user_id
        ");
        
        foreach ($userUpdates as $update) {
            DB::table('communities')
                ->where('id', $update->id)
                ->update(['user_uuid' => $update->user_uuid]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('communities', function (Blueprint $table) {
            $table->dropColumn(['uuid_id', 'user_uuid', 'old_id']);
        });
    }
};
