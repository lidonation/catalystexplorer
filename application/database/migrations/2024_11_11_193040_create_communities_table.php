<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('communities', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->text('content');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('status', 255);
            $table->timestamps(0);
            $table->timestamp('deleted_at')->nullable();
            $table->string('slug', 255);
        });

        DB::statement('ALTER TABLE communities ADD CONSTRAINT check_status CHECK (status IN (\'draft\', \'pending\', \'accepted\', \'available\', \'claimed\', \'completed\', \'published\'))');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('communities');
    }
};