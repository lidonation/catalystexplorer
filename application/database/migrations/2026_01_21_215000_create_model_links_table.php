<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('model_links', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('model_type');
            $table->uuid('model_id');
            $table->uuid('link_id');
            $table->timestamps();

            $table->index(['model_type', 'model_id']);
            $table->index('link_id');
            $table->unique(['model_type', 'model_id', 'link_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('model_links');
    }
};
