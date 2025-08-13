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
        Schema::table('connections', function (Blueprint $table) {
            // Add temporary nullable text columns
            $table->text('previous_model_id_text')->nullable();
            $table->text('next_model_id_text')->nullable();
        });

        // Copy existing bigint values to text columns (simple conversion)
        DB::statement('
            UPDATE connections 
            SET 
                previous_model_id_text = CASE 
                    WHEN previous_model_id IS NOT NULL THEN previous_model_id::text
                    ELSE NULL
                END,
                next_model_id_text = CASE 
                    WHEN next_model_id IS NOT NULL THEN next_model_id::text
                    ELSE NULL
                END
        ');

        // Convert IdeascaleProfile connections using old_id column
        DB::statement('
            UPDATE connections c
            SET next_model_id_text = ip.id::text
            FROM ideascale_profiles ip
            WHERE c.next_model_type = \'App\\Models\\IdeascaleProfile\'
                AND c.next_model_id = ip.old_id
                AND ip.old_id IS NOT NULL
        ');

        DB::statement('
            UPDATE connections c
            SET previous_model_id_text = ip.id::text
            FROM ideascale_profiles ip
            WHERE c.previous_model_type = \'App\\Models\\IdeascaleProfile\'
                AND c.previous_model_id = ip.old_id
                AND ip.old_id IS NOT NULL
        ');

        Schema::table('connections', function (Blueprint $table) {
            // Drop old bigint columns
            $table->dropColumn(['previous_model_id', 'next_model_id']);
        });

        Schema::table('connections', function (Blueprint $table) {
            // Rename text columns to original names
            $table->renameColumn('previous_model_id_text', 'previous_model_id');
            $table->renameColumn('next_model_id_text', 'next_model_id');
        });

        Schema::table('connections', function (Blueprint $table) {
            // Make the columns nullable
            $table->text('previous_model_id')->nullable()->change();
            $table->text('next_model_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('connections', function (Blueprint $table) {
            // Add back the bigint columns
            $table->bigInteger('previous_model_id_bigint')->nullable();
            $table->bigInteger('next_model_id_bigint')->nullable();
        });

        // Try to convert text back to bigint where possible
        DB::statement('
            UPDATE connections 
            SET 
                previous_model_id_bigint = CASE 
                    WHEN previous_model_id ~ \'^\\d+$\' THEN previous_model_id::bigint
                    ELSE NULL
                END,
                next_model_id_bigint = CASE 
                    WHEN next_model_id ~ \'^\\d+$\' THEN next_model_id::bigint
                    ELSE NULL
                END
        ');

        Schema::table('connections', function (Blueprint $table) {
            $table->dropColumn(['previous_model_id', 'next_model_id']);
        });

        Schema::table('connections', function (Blueprint $table) {
            $table->renameColumn('previous_model_id_bigint', 'previous_model_id');
            $table->renameColumn('next_model_id_bigint', 'next_model_id');
        });
    }
};
