<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookmark_collections', function (Blueprint $table) {
            if (!Schema::hasColumn('bookmark_collections', 'fund_id')) {
                $table->foreignId('fund_id')->nullable()->constrained('funds');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookmark_collection', function (Blueprint $table) {
            $table->dropColumn('fund_id');
        });
    }
};
