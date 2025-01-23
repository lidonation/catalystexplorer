<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLinksTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('links', function (Blueprint $table) {
            $table->string('type')->nullable();
            $table->text('link')->change();
            $table->string('label')->nullable();
            $table->text('title')->nullable();
            $table->string('status')->default('published');
            $table->integer('order')->default(0);
            $table->boolean('valid')->default(true);
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('links', function (Blueprint $table) {
            $table->dropColumn(['type', 'label', 'title', 'status', 'order', 'valid', 'deleted_at']);
            $table->string('link')->change();
        });
    }
}
