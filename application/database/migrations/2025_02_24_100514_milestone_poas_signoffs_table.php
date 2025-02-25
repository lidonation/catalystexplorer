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
        Schema::create('milestone_poas_signoffs', function (Blueprint $table) {
            $table->bigInteger('id', false);
            $table->foreignId('milestone_poas_id')
                ->nullable();
            $table->timestamp('created_at');
            $table->string('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('milestone_poas_signoffs');
    }
};