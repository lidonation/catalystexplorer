<?php

use App\Models\BookmarkCollection;
use App\Models\User;
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
        Schema::create('bookmark_items', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class);
            $table->foreignIdFor(BookmarkCollection::class)->nullable();
            $table->unsignedBigInteger('model_id');
            $table->string('model_type');
            $table->text('title')->nullable();
            $table->text('content')->nullable();
            $table->unsignedSmallInteger('action')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookmark_items');
    }
};
