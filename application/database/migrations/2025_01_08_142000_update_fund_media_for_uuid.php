<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // This migration should run AFTER the Fund UUID migration
        // It updates any existing Fund media relationships to use the new UUID IDs
        
        $fundMediaExists = DB::table('media')
            ->where('model_type', 'App\\Models\\Fund')
            ->exists();

        if ($fundMediaExists) {
            // Update media relationships for funds to use UUID
            DB::statement("
                UPDATE media 
                SET model_id = funds.id
                FROM funds 
                WHERE media.model_id::integer = funds.legacy_id
                AND media.model_type = 'App\\Models\\Fund'
                AND funds.legacy_id IS NOT NULL
            ");
        }
    }

    public function down(): void
    {
        // Reverse the process - update Fund media relationships back to legacy integer IDs
        $fundMediaExists = DB::table('media')
            ->where('model_type', 'App\\Models\\Fund')
            ->exists();

        if ($fundMediaExists) {
            DB::statement("
                UPDATE media 
                SET model_id = funds.legacy_id::text
                FROM funds 
                WHERE media.model_id = funds.id
                AND media.model_type = 'App\\Models\\Fund'
                AND funds.legacy_id IS NOT NULL
            ");
        }
    }
};
