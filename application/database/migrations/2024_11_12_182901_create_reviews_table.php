<?php

use App\Enums\StatusEnum;
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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->softDeletes();
            $table->bigInteger('parent_id')->nullable();
            $table->foreignId('reviewer_id')->constrained('reviewers');
            $table->bigInteger('model_id');
            $table->string('model_type');
            $table->string('title')->nullable();
            $table->text('content');
            $table->enum('status', StatusEnum::toValues())->default(StatusEnum::pending()->value)->nullable;
            $table->timestamp('published_at')->nullable();
            $table->integer('ranking_total')->default(0);
            $table->integer('helpful_total')->default(0);
            $table->integer('not_helpful_total')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
