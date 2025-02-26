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
        Schema::create('milestones', function (Blueprint $table) {
            $table->bigInteger('id', false);
            $table->foreignId('proposal_id')
                ->nullable();
            $table->foreignId('fund_id')
                ->nullable();
            $table->text('title');
            $table->boolean('current');
            $table->text('outputs');
            $table->text('success_criteria');
            $table->foreignId('proposal_milestone_id')
                ->nullable();
            $table->text('evidence');
            $table->integer('month');
            $table->double('cost');
            $table->integer('completion_percent');
            $table->timestamp('created_at');
            $table->double('milestone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('milestones');
    }
};
