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
        Schema::create('voting_powers', function (Blueprint $table) {
            $table->id();
            $table->string('delegate');
            $table->unsignedBigInteger('snapshot_id');
            $table->text('voter_id');
            $table->float('voting_power');
            $table->boolean('consumed')->nullable();
            $table->integer('votes_cast')->nullable();
            $table->foreign('snapshot_id')->references('id')->on('snapshots')->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voting_powers');
    }
};
