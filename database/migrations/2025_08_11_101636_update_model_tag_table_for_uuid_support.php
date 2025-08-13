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
        Schema::table('model_tag', function (Blueprint $table) {
            // Change model_id from bigint to text to support both integer and UUID values
            $table->text('model_id')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('model_tag', function (Blueprint $table) {
            // Revert model_id back to bigint
            $table->bigInteger('model_id')->change();
        });
    }
};
