<?php

use App\Enums\MilestoneRoleEnum;
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
        Schema::create('milestone_som_reviews', function (Blueprint $table) {
            $table->bigInteger('id', false);
            $table->foreignId('milestone_id')
                ->nullable();
            $table->boolean('outputs_approves');
            $table->text('outputs_comment')
                ->nullable();
            $table->boolean('success_criteria_approves');
            $table->text('success_criteria_comment')
                ->nullable();
            $table->boolean('evidence_approves');
            $table->text('evidence_comment');
            $table->boolean('current');
            $table->enum('role', [MilestoneRoleEnum::from(0)->role(), MilestoneRoleEnum::from(1)->role(), MilestoneRoleEnum::from(2)->role(), MilestoneRoleEnum::from(3)->role(), MilestoneRoleEnum::from(4)->role()]);
            $table->string('user_id');
            $table->timestamp('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('milestone_som_reviews');
    }
};
