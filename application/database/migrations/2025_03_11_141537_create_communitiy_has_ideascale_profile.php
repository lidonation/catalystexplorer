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
        Schema::create('community_has_ideascale_profile', function (Blueprint $table) {
            $table->foreignId('community_id')->constrained('groups');
            $table->foreignId('ideascale_profile_id')->constrained('ideascale_profiles');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('community_has_ideascale_profile');
    }
};
