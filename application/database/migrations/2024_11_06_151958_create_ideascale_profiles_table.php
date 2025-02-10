<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateIdeascaleProfilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ideascale_profiles', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('ideascale_id')->nullable();
            $table->string('username')->nullable();
            $table->string('email')->nullable();
            $table->string('name')->nullable();
            $table->text('bio')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->string('twitter')->nullable();
            $table->string('linkedin')->nullable();
            $table->string('discord')->nullable();
            $table->string('ideascale')->nullable();
            $table->foreignId('claimed_by_id')
                ->nullable()
                ->constrained('users');
            $table->string('telegram')->nullable();
            $table->string('title', 255)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('ideascale_profiles');
    }
}
