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
        // Drop the table if it exists, as the original migration has incompatible foreign key types
        Schema::dropIfExists('bookmark_collections_users');
        
        // Recreate with proper UUID foreign keys
        Schema::create('bookmark_collections_users', function (Blueprint $table) {
            $table->id();
            $table->uuid('bookmark_collection_id');
            $table->uuid('user_id');
            $table->timestamps();
            
            // Add foreign key constraints
            $table->foreign('bookmark_collection_id')->references('id')->on('bookmark_collections')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
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
