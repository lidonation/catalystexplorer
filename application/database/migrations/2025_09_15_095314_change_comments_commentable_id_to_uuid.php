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
        // First, let's check if there are any invalid UUIDs in the commentable_id column
        $invalidCount = DB::selectOne("
            SELECT COUNT(*) as count
            FROM comments 
            WHERE commentable_id IS NOT NULL 
            AND NOT (commentable_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
        ")->count;
        
        if ($invalidCount > 0) {
            $invalidSamples = DB::select("
                SELECT commentable_id, commentable_type, COUNT(*) as count
                FROM comments 
                WHERE commentable_id IS NOT NULL 
                AND NOT (commentable_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
                GROUP BY commentable_id, commentable_type
                ORDER BY count DESC
                LIMIT 5
            ");
            
            $sampleText = '';
            foreach ($invalidSamples as $sample) {
                $sampleText .= "'{$sample->commentable_id}' ({$sample->commentable_type}) - {$sample->count} records; ";
            }
            
            throw new \Exception("Cannot convert commentable_id to UUID: {$invalidCount} invalid UUID values found. Samples: {$sampleText}. Please clean up the data first.");
        }
        
        // Change the column type from text to uuid
        DB::statement('ALTER TABLE comments ALTER COLUMN commentable_id TYPE uuid USING commentable_id::uuid');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert the column type from uuid back to text
        DB::statement('ALTER TABLE comments ALTER COLUMN commentable_id TYPE text USING commentable_id::text');
    }
};
