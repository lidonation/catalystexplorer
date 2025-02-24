<?php

use App\Enums\MilestoneStatusEnum;
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
        Schema::create('proposal_milestones', function (Blueprint $table) {
            $table->bigInteger('id', false);
            $table->text('title');
            $table->text('url');
            $table->foreignId('proposal_id')
                ->nullable();
            $table->bigInteger('project_id', false);
            $table->timestamp('created_at');
            $table->double('budget');
            $table->integer('milestones_qty');
            $table->double('funds_distributed');
            $table->timestamp('starting_date');
            $table->string('currency');
            $table->enum('status', [MilestoneStatusEnum::from(0)->status(), MilestoneStatusEnum::from(1)->status(), MilestoneStatusEnum::from(3)->status()]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal_milestones');
    }
};