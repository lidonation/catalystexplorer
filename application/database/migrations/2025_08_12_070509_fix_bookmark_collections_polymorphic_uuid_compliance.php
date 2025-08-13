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
        echo "Fixing bookmark_collections polymorphic UUID compliance...\n";
        
        // 1. Fix parent_id: Change from bigint to uuid (self-referencing)
        // Since there are no records with parent_id, we can safely change the type
        Schema::table('bookmark_collections', function (Blueprint $table) {
            $table->dropColumn('parent_id');
        });
        
        Schema::table('bookmark_collections', function (Blueprint $table) {
            $table->uuid('parent_id')->nullable()->after('user_id');
        });
        
        echo "Updated parent_id column to UUID\n";
        
        // 2. Fix type_id: Change from bigint to text (polymorphic reference)
        // Since there are no records with type_id, we can safely change the type
        Schema::table('bookmark_collections', function (Blueprint $table) {
            $table->dropColumn('type_id');
        });
        
        Schema::table('bookmark_collections', function (Blueprint $table) {
            $table->text('type_id')->nullable()->after('type');
        });
        
        echo "Updated type_id column to text (for polymorphic references)\n";
        
        // 3. Fix model_id: Change from bigint to text and handle TinderCollection references
        // First, add a temporary text column
        Schema::table('bookmark_collections', function (Blueprint $table) {
            $table->text('model_id_temp')->nullable()->after('model_id');
        });
        
        // Convert existing TinderCollection references to text
        // Since TinderCollection still uses bigint IDs, we'll convert them to text for now
        DB::statement("
            UPDATE bookmark_collections 
            SET model_id_temp = model_id::text
            WHERE model_type = 'App\\Models\\TinderCollection'
              AND model_id IS NOT NULL
        ");
        
        $updated = DB::table('bookmark_collections')
            ->where('model_type', 'App\\Models\\TinderCollection')
            ->whereNotNull('model_id')
            ->count();
            
        echo "Converted {$updated} TinderCollection references to text\n";
        
        // Drop the old bigint column and rename the temp column
        Schema::table('bookmark_collections', function (Blueprint $table) {
            $table->dropColumn('model_id');
        });
        
        DB::statement('ALTER TABLE bookmark_collections RENAME COLUMN model_id_temp TO model_id');
        
        echo "Successfully fixed bookmark_collections polymorphic UUID compliance\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is complex to reverse
        throw new Exception('This migration cannot be easily reversed. Please restore from backup if needed.');
    }
};
