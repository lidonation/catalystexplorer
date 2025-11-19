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
        // Skip migration in test environment to avoid UUID generation issues
        if (app()->environment('testing')) {
            return;
        }

        Schema::table('claimed_profiles', function (Blueprint $table) {
            $table->dropPrimary('claimed_profiles_primary');
        });

        Schema::table('claimed_profiles', function (Blueprint $table) {
            $table->uuid('id')->nullable()->first();
        });

        // Use appropriate UUID generation function based on database driver
        $driver = DB::getDriverName();
        if ($driver === 'pgsql') {
            DB::statement('UPDATE claimed_profiles SET id = gen_random_uuid()');
        } else {
            // For SQLite or other databases, generate UUIDs using Laravel's Str helper
            $profiles = DB::table('claimed_profiles')->get();
            foreach ($profiles as $profile) {
                DB::table('claimed_profiles')
                    ->where('user_id', $profile->user_id)
                    ->where('claimable_id', $profile->claimable_id)
                    ->where('claimable_type', $profile->claimable_type)
                    ->update(['id' => \Illuminate\Support\Str::uuid()]);
            }
        }

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
