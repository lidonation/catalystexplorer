<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This creates a polymorphic pivot table following the exact pattern as proposal_profiles.
     * Used with BelongsToMany relationships and extra pivot columns like 'claimed_at'.
     */
    public function up(): void
    {
        Schema::create('claimed_profiles', function (Blueprint $table) {
            $table->uuid('user_id');
            $table->uuid('claimable_id');
            $table->string('claimable_type'); // 'App\Models\CatalystProfile' or 'App\Models\IdeascaleProfile'
            $table->timestamp('claimed_at')->useCurrent();
            $table->timestamps();

            // Composite primary key like proposal_profiles pattern
            $table->primary(['user_id', 'claimable_id', 'claimable_type'], 'claimed_profiles_primary');

            // Indexes for performance
            $table->index(['user_id']);
            $table->index(['claimable_id', 'claimable_type']);

            // Foreign key constraints
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('claimed_profiles');
    }
};
