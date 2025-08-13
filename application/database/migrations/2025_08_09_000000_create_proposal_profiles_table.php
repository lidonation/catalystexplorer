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
        Schema::create('proposal_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposal_id')->constrained('proposals');
            $table->string('profile_type');
            $table->string('profile_id'); // Use string to support UUIDs
            $table->index(['proposal_id', 'profile_type', 'profile_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal_profiles');
    }
};
