<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('name')->nullable()->after('user_id');
            $table->string('email')->nullable()->after('name');
            $table->string('website')->nullable()->after('email');
            $table->string('github')->nullable()->after('website');
            $table->string('linkedin')->nullable()->after('github');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn([
                'name',
                'email',
                'website',
                'github',
                'linkedin'
            ]);
        });
    }
};
