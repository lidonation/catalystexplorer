<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // First, let's back up any existing campaign media relationships
        // by storing them temporarily
        DB::statement('
            CREATE TEMPORARY TABLE temp_campaign_media AS
            SELECT 
                media.id as media_id,
                campaigns.id as campaign_uuid,
                campaigns.legacy_id as campaign_legacy_id
            FROM media 
            JOIN campaigns ON campaigns.legacy_id = media.model_id::integer
            WHERE media.model_type = \'App\\Models\\Campaign\'
        ');

        // Also backup any non-campaign media relationships
        DB::statement('
            CREATE TEMPORARY TABLE temp_other_media AS
            SELECT 
                media.id as media_id,
                media.model_id as original_model_id,
                media.model_type as original_model_type
            FROM media 
            WHERE media.model_type != \'App\\Models\\Campaign\'
            AND media.model_id IS NOT NULL
        ');

        // Drop the existing morphs columns
        Schema::table('media', function (Blueprint $table) {
            $table->dropColumn(['model_id', 'model_type']);
        });

        // Add new polymorphic columns that can handle both UUIDs and integers (nullable first)
        Schema::table('media', function (Blueprint $table) {
            $table->string('model_id')->nullable(); // Start as nullable
            $table->string('model_type')->nullable(); // Start as nullable
        });

        // Restore campaign media relationships with UUIDs
        DB::statement('
            UPDATE media 
            SET 
                model_id = temp_campaign_media.campaign_uuid,
                model_type = \'App\\Models\\Campaign\'
            FROM temp_campaign_media
            WHERE media.id = temp_campaign_media.media_id
        ');

        // Restore non-campaign media relationships (keep original IDs as strings)
        DB::statement('
            UPDATE media 
            SET 
                model_id = temp_other_media.original_model_id::text,
                model_type = temp_other_media.original_model_type
            FROM temp_other_media
            WHERE media.id = temp_other_media.media_id
        ');
        
        // Create a cast function to help with varchar-integer comparisons
        DB::statement('
            CREATE OR REPLACE FUNCTION safe_int_compare(varchar_val varchar, int_val integer)
            RETURNS boolean AS $$
            BEGIN
                RETURN varchar_val = int_val::text;
            EXCEPTION
                WHEN OTHERS THEN
                    RETURN FALSE;
            END;
            $$ LANGUAGE plpgsql;
        ');

        // Now make the columns non-nullable and add index
        Schema::table('media', function (Blueprint $table) {
            $table->string('model_id')->nullable(false)->change();
            $table->string('model_type')->nullable(false)->change();
            $table->index(['model_id', 'model_type']);
        });
    }

    public function down(): void
    {
        // Back up UUID-based relationships
        DB::statement('
            CREATE TEMPORARY TABLE temp_uuid_media AS
            SELECT 
                media.id as media_id,
                campaigns.legacy_id as legacy_id
            FROM media 
            JOIN campaigns ON campaigns.id = media.model_id
            WHERE media.model_type = \'App\\Models\\Campaign\'
        ');

        // Drop the string-based morphs columns
        Schema::table('media', function (Blueprint $table) {
            $table->dropColumn(['model_id', 'model_type']);
        });

        // Recreate the original integer-based morphs
        Schema::table('media', function (Blueprint $table) {
            $table->morphs('model');
        });

        // Restore relationships with legacy integer IDs
        DB::statement('
            UPDATE media 
            SET 
                model_id = temp_uuid_media.legacy_id,
                model_type = \'App\\Models\\Campaign\'
            FROM temp_uuid_media
            WHERE media.id = temp_uuid_media.media_id
        ');
    }
};
