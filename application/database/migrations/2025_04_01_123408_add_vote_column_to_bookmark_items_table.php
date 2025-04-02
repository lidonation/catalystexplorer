<?php

use App\Enums\VoteEnum;
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
        Schema::table('bookmark_items', function (Blueprint $table) {
            $table->enum('vote', VoteEnum::values())->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookmark_items', function (Blueprint $table) {
            $table->dropColumn('vote');
        });
    }
};
