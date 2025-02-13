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
        Schema::create('moderations', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('moderator_id')->nullable();
            $table->foreignId('reviewer_id');
            $table->foreignId('review_id');
            $table->text('rationale')->nullable();
            $table->boolean('valid')->nullable();
            $table->text('context_type')->nullable();
            $table->foreignId('context_id')->nullable();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('moderations');
    }
};
