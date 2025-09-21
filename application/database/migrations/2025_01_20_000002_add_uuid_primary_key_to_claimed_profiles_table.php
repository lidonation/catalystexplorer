<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('claimed_profiles', function (Blueprint $table) {
            $table->dropPrimary('claimed_profiles_primary');
        });

        Schema::table('claimed_profiles', function (Blueprint $table) {
            $table->uuid('id')->nullable()->first();
        });

        DB::statement('UPDATE claimed_profiles SET id = gen_random_uuid()');

        DB::statement('ALTER TABLE claimed_profiles ALTER COLUMN id SET NOT NULL');

        Schema::table('claimed_profiles', function (Blueprint $table) {
            $table->primary('id');
        });

        Schema::table('claimed_profiles', function (Blueprint $table) {
            $table->unique(['user_id', 'claimable_id', 'claimable_type'], 'claimed_profiles_unique');
        });
    }

    public function down(): void
    {
        Schema::table('claimed_profiles', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            $table->dropUnique('claimed_profiles_unique');
        });

        Schema::table('claimed_profiles', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        Schema::table('claimed_profiles', function (Blueprint $table) {
            $table->primary(['user_id', 'claimable_id', 'claimable_type'], 'claimed_profiles_primary');
        });
    }
};
