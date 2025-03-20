<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('tx_hash')->unique()->index();
            $table->integer('epoch')->nullable();
            $table->string('block')->nullable();
            $table->json('json_metadata')->nullable();
            $table->jsonb('raw_metadata')->nullable();
            $table->json('inputs')->nullable();
            $table->json('outputs')->nullable();
            $table->string('type')->nullable();
            $table->string('created_at')->nullable();
            $table->json('voters_details')->nullable();
            $table->bigInteger('total_output')->nullable();
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
