<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookmark_collections', function (Blueprint $table) {
            DB::table('bookmark_collections')
                ->whereNotIn('allow_comments', ['true', 'false', '1', '0', 't', 'f'])
                ->update(['allow_comments' => 'false']);
        });

        DB::statement("
        ALTER TABLE bookmark_collections 
        ALTER COLUMN allow_comments TYPE boolean 
        USING (
            CASE 
                WHEN allow_comments IN ('true', '1', 't') THEN true
                ELSE false
            END
        )
    ");

        Schema::table('bookmark_collections', function (Blueprint $table) {
            $table->boolean('allow_comments')->default(false)->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookmark_collections', function (Blueprint $table) {
            //
        });
    }
};
