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
            DB::statement('ALTER TABLE bookmark_collections ALTER COLUMN allow_comments TYPE boolean USING (allow_comments::boolean)');
            $table->boolean('allow_comments')->nullable(false)->default(false)->change();
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
