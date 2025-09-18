<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('catalyst_profiles', function (Blueprint $table) {
            $table->dropColumn('claimed_by');
        });

        Schema::table('catalyst_profiles', function (Blueprint $table) {
            // Add the column back as UUID type
            $table->uuid('claimed_by')->nullable();
            
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        
    }
};