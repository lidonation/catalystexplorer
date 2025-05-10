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

        Schema::dropIfExists('dreps');

        Schema::create('catalyst_dreps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->string('name', 255);
            $table->string('email', 255)->unique();
            $table->text('bio')->nullable();
            $table->text('link')->nullable();
            $table->text('objective')->nullable();
            $table->text('motivation')->nullable();
            $table->text('qualifications')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalyst_dreps');
    }
};
