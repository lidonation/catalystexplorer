<?php

use App\Enums\CatalystCurrencies;
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
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->constrained('users');
            $table->unsignedBigInteger('fund_id')->nullable()->constrained('funds');
            $table->string('title', 255);
            $table->string('meta_title', 255);
            $table->string('slug', 255);
            $table->text('excerpt')->nullable();
            $table->text('comment_prompt')->nullable();
            $table->text('content')->nullable();
            $table->double('amount')->nullable();
            $table->string('status')->nullable();
            $table->timestamp('launched_at')->nullable();
            $table->timestamp('awarded_at')->nullable();
            $table->timestamps();
            $table->timestamp('deleted_at')->nullable();
            $table->string('color')->nullable();
            $table->string('label')->nullable();
            $table->enum('currency', CatalystCurrencies::toValues());
            $table->timestamp('review_started_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
