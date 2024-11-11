<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCatalystGroupsTable extends Migration
{
    public function up()
    {
        Schema::create('catalyst_groups', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->nullable();
            $table->string('name', 255);
            $table->json('bio')->nullable();
            $table->timestamp('deleted_at')->nullable();
            $table->timestamps(0);
            $table->text('slug')->nullable();
            $table->text('status')->nullable();
            $table->text('meta_title')->nullable();
            $table->string('website', 255)->nullable();
            $table->string('twitter', 255)->nullable();
            $table->string('discord', 255)->nullable();
            $table->string('github', 255)->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('catalyst_groups');
    }
}
