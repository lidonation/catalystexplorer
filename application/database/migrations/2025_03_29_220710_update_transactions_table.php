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
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('voters_details');
            $table->dropColumn('total_output');
            $table->string('stake_pub')->nullable();
            $table->string('stake_key')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->json('voters_details')->nullable();
            $table->bigInteger('total_output')->nullable();
            $table->dropColumn('stake_pub');
            $table->dropColumn('stake_key');
        });
    }
};