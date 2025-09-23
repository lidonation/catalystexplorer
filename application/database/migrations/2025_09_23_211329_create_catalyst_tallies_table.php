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
        Schema::create('catalyst_tallies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('hash')->unique()->index();
            $table->integer('tally');
            $table->string('model_type')->nullable();
            $table->uuid('model_id')->nullable();
            $table->uuid('context_id')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();
            
            $table->index(['model_type', 'model_id']);
            $table->index('context_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalyst_tallies');
    }
};
