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
        // Check if table already exists
        if (Schema::hasTable('proposal_profiles')) {
            // Table exists, check if profile_id needs to be converted to string
            $columnType = DB::select("SELECT data_type FROM information_schema.columns WHERE table_name='proposal_profiles' AND column_name='profile_id'")[0]->data_type;
            
            if ($columnType === 'bigint') {
                // Convert profile_id from bigint to varchar to support UUIDs
                Schema::table('proposal_profiles', function (Blueprint $table) {
                    $table->string('profile_id', 255)->change();
                });
            }
        } else {
            // Create new table
            Schema::create('proposal_profiles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('proposal_id')->constrained('proposals');
                $table->string('profile_type');
                $table->string('profile_id'); // Use string to support UUIDs
                $table->index(['proposal_id', 'profile_type', 'profile_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal_profiles');
    }
};
