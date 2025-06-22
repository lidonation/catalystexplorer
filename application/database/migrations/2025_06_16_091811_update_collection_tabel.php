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
            if (Schema::hasColumn('bookmark_collections', 'parent_id')) {
                $table->dropColumn('parent_id');
            }

            if (!Schema::hasColumn('bookmark_collections', 'fund_id')) {
                $table->foreignId('fund_id')->nullable()->constrained('funds');
            }

            if (Schema::hasColumn('bookmark_collections', 'type_id') && !Schema::hasColumn('bookmark_collections', 'model_id')) {
                DB::statement("ALTER TABLE bookmark_collections RENAME COLUMN type_id TO model_id");
            }

            if (Schema::hasColumn('bookmark_collections', 'type') && !Schema::hasColumn('bookmark_collections', 'model_type')) {
                DB::statement("ALTER TABLE bookmark_collections RENAME COLUMN type TO model_type");
            }

            if (Schema::hasColumn('bookmark_collections', 'type_type') && !Schema::hasColumn('bookmark_collections', 'type')) {
                DB::statement("ALTER TABLE bookmark_collections RENAME COLUMN type_type TO type");
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Schema::table('bookmarks_collections', function (Blueprint $table) {
        //     //
        // });
    }
};
