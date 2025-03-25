<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\CatalystCurrencies;
use App\Enums\NftStatusEnum;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {            
        Schema::create('nfts', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->nullable();
            $table->bigInteger('artist_id')->nullable();
            $table->bigInteger('model_id')->nullable();
            $table->text('model_type')->nullable();
            $table->text('storage_link')->nullable();
            $table->text('preview_link')->nullable();
            $table->text('name');
            $table->text('policy')->nullable();
            $table->text('owner_address')->nullable();
            $table->json('description')->nullable();
            $table->text('rarity')->nullable();
            $table->enum('status', NftStatusEnum::toArray())->default(NftStatusEnum::minted()->value);
            $table->decimal('price', 20, 6)->nullable();
            $table->text('currency', CatalystCurrencies::values())->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('minted_at')->nullable();
            $table->integer('qty')->default(1);
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
        Schema::dropIfExists('nfts');
    }
};
