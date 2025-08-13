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
        echo "Fixing action_events model_id column type...\n";
        
        // Change model_id from bigint to text to support UUIDs
        Schema::table('action_events', function (Blueprint $table) {
            $table->text('model_id')->change();
        });
        
        echo "✅ Successfully updated action_events.model_id to text type\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        echo "Rolling back action_events model_id column type...\n";
        
        // Change model_id back from text to bigint
        Schema::table('action_events', function (Blueprint $table) {
            $table->bigInteger('model_id')->change();
        });
        
        echo "✅ Successfully reverted action_events.model_id to bigint type\n";
    }
};
