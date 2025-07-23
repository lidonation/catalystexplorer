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
            
            if (!Schema::hasColumn('bookmark_collections', 'model_id')) {
                $table->foreignId('model_id')->nullable();
            }

            if (!Schema::hasColumn('bookmark_collections', 'model_type')) {
                $table->foreignId('model_type')->nullable();
            }

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookmark_collections', function (Blueprint $table) {
            $table->dropColumn('model_id');
            $table->dropColumn('model_type');
        });
    }
};
