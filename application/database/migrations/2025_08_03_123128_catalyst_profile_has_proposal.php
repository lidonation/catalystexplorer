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
        Schema::create('catalyst_profile_has_proposal', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catalyst_profile_id')->constrained('catalyst_profiles');
            $table->foreignId('proposal_id')->constrained('proposals');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalyst_profile_has_proposal');
    }
};
