<?php

use App\Enums\LogicalOperators;
use App\Enums\Operators;
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
        Schema::create('rules', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subject');
            $table->enum('operator', Operators::toValues());
            $table->string('predicate')->nullable();
            $table->enum('logical_operator', LogicalOperators::toValues());
            $table->unsignedBigInteger('model_id');
            $table->string('model_type');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rules');
    }
};
