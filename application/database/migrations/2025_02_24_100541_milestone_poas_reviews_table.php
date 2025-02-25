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
        Schema::create('milestone_poas_reviews', function (Blueprint $table) {
            $table->bigInteger('id', false);
            $table->boolean('content_approved');
            $table->text('content_comment');
            $table->foreignId('milestone_poas_id');
            $table->enum('role', [MilestoneRoleEnum::from(0)->role(), MilestoneRoleEnum::from(1)->role(), MilestoneRoleEnum::from(2)->role(), MilestoneRoleEnum::from(3)->role(), MilestoneRoleEnum::from(4)->role()]);
            $table->timestamp('created_at');
            $table->string('user_id');
            $table->boolean('current');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('milestone_poas_reviews');
    }
};