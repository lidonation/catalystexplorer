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
        Schema::table('catalyst_dreps', function (Blueprint $table) {
            // Add new JSON columns
            $table->json('bio_json')->nullable();
            $table->json('motivation_json')->nullable();
            $table->json('qualifications_json')->nullable();
            $table->json('objective_json')->nullable();
        });

        // Migrate existing data to JSON format for English locale
        DB::statement("
            UPDATE catalyst_dreps 
            SET bio_json = CASE 
                WHEN bio IS NULL THEN NULL 
                ELSE json_build_object('en', bio)
            END
        ");
        
        DB::statement("
            UPDATE catalyst_dreps 
            SET motivation_json = CASE 
                WHEN motivation IS NULL THEN NULL 
                ELSE json_build_object('en', motivation)
            END
        ");
        
        DB::statement("
            UPDATE catalyst_dreps 
            SET qualifications_json = CASE 
                WHEN qualifications IS NULL THEN NULL 
                ELSE json_build_object('en', qualifications)
            END
        ");
        
        DB::statement("
            UPDATE catalyst_dreps 
            SET objective_json = CASE 
                WHEN objective IS NULL THEN NULL 
                ELSE json_build_object('en', objective)
            END
        ");

        Schema::table('catalyst_dreps', function (Blueprint $table) {
            // Drop old columns
            $table->dropColumn(['bio', 'motivation', 'qualifications', 'objective']);
        });

        Schema::table('catalyst_dreps', function (Blueprint $table) {
            // Rename new columns to original names
            $table->renameColumn('bio_json', 'bio');
            $table->renameColumn('motivation_json', 'motivation');
            $table->renameColumn('qualifications_json', 'qualifications');
            $table->renameColumn('objective_json', 'objective');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('catalyst_dreps', function (Blueprint $table) {
            $table->text('bio')->nullable()->change();
            $table->text('motivation')->nullable()->change();
            $table->text('qualifications')->nullable()->change();
            $table->text('objective')->nullable()->change();
        });
    }
};
