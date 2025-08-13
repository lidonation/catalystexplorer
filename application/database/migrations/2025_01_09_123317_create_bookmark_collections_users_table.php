<?php

use App\Models\BookmarkCollection;
use App\Models\User;
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
        Schema::create('bookmark_collections_users', function (Blueprint $table) {
            // Use specific column types to match actual table schemas
            // Check what type the referenced tables use and match accordingly
            $usersIdType = DB::select('SELECT data_type FROM information_schema.columns WHERE table_name = ? AND column_name = ?', ['users', 'id']);
            $bookmarkCollectionsIdType = DB::select('SELECT data_type FROM information_schema.columns WHERE table_name = ? AND column_name = ?', ['bookmark_collections', 'id']);
            
            // Set column types based on referenced tables
            if (!empty($bookmarkCollectionsIdType) && $bookmarkCollectionsIdType[0]->data_type === 'uuid') {
                $table->uuid('bookmark_collection_id');
            } else {
                $table->unsignedBigInteger('bookmark_collection_id');
            }
            
            if (!empty($usersIdType) && $usersIdType[0]->data_type === 'uuid') {
                $table->uuid('user_id');
            } else {
                $table->unsignedBigInteger('user_id');
            }
            
            $table->timestamps();
            
            $table->primary(['bookmark_collection_id', 'user_id']);
            
            // Add foreign key constraints
            $table->foreign('bookmark_collection_id')
                  ->references('id')
                  ->on('bookmark_collections')
                  ->onDelete('cascade');
                  
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookmark_collections_users');
    }
};
