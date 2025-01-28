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
        Schema::create('voter_history', function (Blueprint $table) {
            $table->id();
            $table->text('stake_address');
            $table->text('fragment_id');
            $table->text('caster');
            $table->text('time');
            $table->text('raw_fragment');
            $table->bigInteger('proposal');
            $table->integer('choice');
            $table->bigInteger('catalyst_snapshot_id')->nullable();
            $table->timestamps(0);
            $table->softDeletesTz('deleted_at', 0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voter_history');
    }
};
