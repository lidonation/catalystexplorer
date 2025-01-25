<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CreateCatalystConnectionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('connections', function (Blueprint $table) {
            $table->bigIncrements('id')->unsigned();
            $table->string('previous_model_type', 255);
            $table->bigInteger('previous_model_id');
            $table->string('next_model_type', 255);
            $table->bigInteger('next_model_id');
            $table->timestamps(0);
        });

        // Bind the sequence to the `id` column of the table
        DB::statement('
            ALTER SEQUENCE connections_id_seq OWNED BY connections.id
        ');
    }

    /**
     * Drops the custom sequence 'connections_id_seq' and the 'connections' table.
     *
     * @return void
     */
    public function down()
    {
        DB::statement('DROP SEQUENCE IF EXISTS connections_id_seq');

        Schema::dropIfExists('connections');
    }
}
