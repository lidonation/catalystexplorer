<?php

use App\Enums\MetricCountBy;
use App\Enums\MetricQueryTypes;
use App\Enums\MetricTypes;
use App\Enums\StatusEnum;
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
        Schema::create('metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users', 'id')
                ->nullOnDelete();
            $table->text('title');
            $table->text('content')->nullable();
            $table->text('field')->nullable();
            $table->text('context')->nullable();
            $table->enum('type', MetricTypes::toArray());
            $table->enum('query', MetricQueryTypes::toArray());
            $table->enum('count_by', MetricCountBy::toArray())->nullable();
            $table->enum('status', StatusEnum::toArray())->default(StatusEnum::draft());
            $table->smallInteger('order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('metrics');
    }
};
