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
        Schema::table('bookmark_collections', function (Blueprint $table) {
            // Drop the existing text column
            $table->dropColumn('type_id');
        });
        
        Schema::table('bookmark_collections', function (Blueprint $table) {
            // Add the new UUID column
            $table->uuid('type_id')->nullable()->after('type_type');
        });
        
        echo "Changed bookmark_collections.type_id from text to UUID\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookmark_collections', function (Blueprint $table) {
            // Drop the UUID column
            $table->dropColumn('type_id');
        });
        
        Schema::table('bookmark_collections', function (Blueprint $table) {
            // Restore the original text column
            $table->text('type_id')->nullable()->after('type_type');
        });
        
        echo "Reverted bookmark_collections.type_id from UUID back to text\n";
    }
};
