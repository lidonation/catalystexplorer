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
        Schema::create('ideascale_profile_has_proposal', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ideascale_profile_id')->constrained('ideascale_profiles');
            $table->foreignId('proposal_id')->constrained('proposals');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ideascale_profile_has_proposal');
    }
};
