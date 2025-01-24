<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\StatusEnums;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('links', function (Blueprint $table) {
            $table->id();
            $table->string('type')->nullable();
            $table->text('link');
            $table->string('label')->nullable();
            $table->text('title')->nullable();
            $table->enum('status', StatusEnum::toArray())->default(StatusEnums::published()->value);
            $table->integer('order')->default(0);
            $table->boolean('valid')->default(true);
            $table->softDeletes();
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('links');
    }
};
