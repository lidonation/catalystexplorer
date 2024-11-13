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
        Schema::create('discussions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->nullable();
            $table->char('model_type')->nullable();
            $table->bigInteger('model_id')->nullable();
            $table->enum('status',StatusEnum::toArray())->default(StatusEnum::draft());
            $table->integer('order')->default(0)->nullable();
            $table->text('content')->nullable();
            $table->text('comment_prompt')->nullable();
            $table->timestamp('published_at');
            $table->timestamps();
           
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discussions');
    }
};
