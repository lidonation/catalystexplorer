<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalyst_drep_user', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));

            $table->uuid('catalyst_drep_id');
            $table->uuid('user_id');

            $table->string('catalyst_drep_stake_address');
            $table->string('user_stake_address');

            $table->timestamps();

            $table->foreign('catalyst_drep_id')
                ->references('id')
                ->on('catalyst_dreps')
                ->cascadeOnDelete();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->unique(['catalyst_drep_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalyst_drep_user');
    }
};