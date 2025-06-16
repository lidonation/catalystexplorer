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
            $table->dropColumn('parent_id');
            $table->foreignId('fund_id')->nullable()->constrained('funds');
            $table->renameColumn('type_id',to: 'model_id');
            $table->renameColumn('type', to: 'model_type');
            $table->renameColumn('type_type', to: 'type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Schema::table('bookmarks_collections', function (Blueprint $table) {
        // });
    }
};
