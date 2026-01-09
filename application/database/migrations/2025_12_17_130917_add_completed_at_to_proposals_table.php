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
        if (Schema::hasTable('proposals') && !Schema::hasColumn('proposals', 'completed_at')) {
            Schema::table('proposals', function (Blueprint $table) {
                $table->timestamp('completed_at')->nullable()->after('updated_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('proposals') && Schema::hasColumn('proposals', 'completed_at')) {
            Schema::table('proposals', function (Blueprint $table) {
                $table->dropColumn('completed_at');
            });
        }
    }
};
