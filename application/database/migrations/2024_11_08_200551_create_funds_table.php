<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('funds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('title', 150);
            $table->string('meta_title', 150);
            $table->string('slug', 150);
            $table->text('excerpt')->nullable();
            $table->text('comment_prompt')->nullable();
            $table->text('content')->nullable();
            $table->double('amount', 15, 2)->default(0);
            $table->string('status', 255)->nullable();
            $table->timestamp('launched_at')->nullable();
            $table->softDeletes('deleted_at');
            $table->timestamps();
            $table->foreignId('parent_id')->nullable()->constrained('funds')->onDelete('cascade');
            $table->timestamp('awarded_at')->nullable();
            $table->text('color')->nullable();
            $table->text('label')->nullable();
            $table->string('currency', 3)->default('usd'); 
            $table->timestamp('assessment_started_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('funds');
    }
};
