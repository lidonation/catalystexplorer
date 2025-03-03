<?php

use App\Enums\BookmarkStatus;
use App\Enums\BookmarkVisibility;
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
        Schema::create('bookmark_collections', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class);
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->text('title');
            $table->text('content')->nullable();
            $table->string('color');
            $table->string('allow_comments')->nullable();
            $table->string('visibility')->default(BookmarkVisibility::UNLISTED()->value);
            $table->string('status')->default(BookmarkStatus::DRAFT()->value);
            $table->string('type')->default(BookmarkCollection::class);
            $table->unsignedBigInteger('type_id')->nullable();
            $table->string('type_type')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookmark_collections');
    }
};
