<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\StatusEnum;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('txes', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->nullable()->constrained()->nullOnDelete();
            $table->bigInteger('model_id');
            $table->text('model_type');
            $table->text('policy')->nullable();
            $table->text('txhash')->nullable();
            $table->text('address')->nullable();
            $table->enum('status', StatusEnum::toArray())->default(StatusEnum::published()->value);
            $table->double('quantity', 20, 6);
            $table->json('metadata')->nullable();
            $table->timestamp('minted_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['model_id', 'model_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('txes');
    }
};
