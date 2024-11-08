<?php

use App\Enums\CatalystCurrencies;
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
        Schema::create('proposals', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('user_id')->nullable();
            $table->bigInteger('campaign_id')->nullable();
            $table->integer('fund_id')->nullable();
            $table->json('title');
            $table->string('slug');
            $table->text('website')->nullable();
            $table->text('excerpt')->nullable();
            $table->double('amount_requested', 15, 2)->default(0);
            $table->double('amount_received', 15, 2)->nullable();
            $table->text('definition_of_success')->nullable();
            $table->string('status', 255);
            $table->text('funding_status')->nullable();
            $table->json('meta_data')->nullable();
            $table->timestamp('funded_at')->nullable();
            $table->timestamp('deleted_at')->nullable();
            $table->date('funding_updated_at')->nullable();
            $table->timestamps();
            $table->bigInteger('yes_votes_count')->nullable();
            $table->bigInteger('no_votes_count')->nullable();
            $table->text('comment_prompt')->nullable();
            $table->text('social_excerpt')->nullable();
            $table->bigInteger('team_id')->nullable();
            $table->text('ideascale_link')->nullable();
            $table->text('type')->nullable();
            $table->json('meta_title')->nullable();
            $table->json('problem')->nullable();
            $table->json('solution')->nullable();
            $table->json('experience')->nullable();
            $table->json('content')->nullable();
            $table->enum('currency', CatalystCurrencies::values())->nullable();
            $table->boolean('opensource')->default(false);
            $table->integer('ranking_total')->default(0);
            $table->string('quickpitch', 255)->nullable();
            $table->integer('quickpitch_length')->nullable();
            $table->bigInteger('abstain_votes_count')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposals');
    }
};
