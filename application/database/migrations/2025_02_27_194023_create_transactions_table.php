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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('hash')->unique();
            $table->integer('epoch');
            $table->bigInteger('block');
            $table->bigInteger('total_output');
            $table->json('inputs');
            $table->json('outputs');
            $table->bigInteger('fund_id')->nullable();
            $table->nullableMorphs('model');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
