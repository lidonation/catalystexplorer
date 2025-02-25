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
        Schema::create('milestone_poas', function (Blueprint $table) {
            $table->bigInteger('id', false);
            $table->text('content');
            $table->foreignId('milestone_id')
                ->nullable();
            $table->timestamp('created_at');
            $table->boolean('current');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('milestone_poas');
    }
};
