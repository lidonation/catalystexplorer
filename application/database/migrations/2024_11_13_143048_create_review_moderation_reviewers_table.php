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
        Schema::create('review_moderation_reviewers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_moderation_id')->constrained('review_moderations');
            $table->foreignId('review_id')->constrained('reviews');
            $table->foreignId('reviewer_id')->constrained('reviewers');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_moderation_reviewers');
    }
};
