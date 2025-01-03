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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('email', 255)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password', 255)->nullable();
            $table->rememberToken();
            $table->foreignId('current_team_id')->nullable()->constrained()->onDelete('set null');
            $table->text('profile_photo_path')->nullable();
            $table->timestamps();
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->text('short_bio')->nullable();
            $table->text('bio')->nullable();
            $table->string('wallet_stake_address', 255)->nullable();
            $table->string('wallet_address', 255)->nullable();
            $table->string('wallet_validation_seed_tx', 255)->nullable();
            $table->string('wallet_validation_seed_index', 255)->nullable();
            $table->string('wallet_validation_seed_amount', 255)->nullable();
            $table->text('git')->nullable();
            $table->text('discord')->nullable();
            $table->text('linkedin')->nullable();
            $table->text('telegram')->nullable();
            $table->text('twitter')->nullable();
            $table->text('active_pool_id')->nullable();
            $table->string('lang', 255)->default('en');
            $table->foreignId('primary_account_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('super')->default(false);
            $table->string('avatar', 255)->nullable();
            $table->json('preferences')->nullable();
            $table->timestamp('last_login')->nullable();
            $table->boolean('did_verified')->default(false);
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
