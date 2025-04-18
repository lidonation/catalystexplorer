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
        Schema::create('review_moderations', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('reviewer_id')->constrained('reviewers');
            $table->integer('excellent_count')->default(0);
            $table->integer('good_count')->default(0);
            $table->integer('filtered_out_count')->default(0);
            $table->json('qa_rationale')->nullable();
            $table->boolean('flagged')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_moderations');
    }
};
