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
        Schema::create('snapshots', function (Blueprint $table) {
            $table->id();
            $table->string('snapshot_name');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->integer('epoch');
            $table->smallInteger('order');

            $table->timestamp('snapshot_at');

            $table->index(['model_type', 'model_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('snapshots');
    }
};
