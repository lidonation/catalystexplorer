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
        \App\Models\CatalystProfile::chunk(100, function ($profiles) {
            foreach ($profiles as $profile) {
                if (empty($profile->catalyst_id) || !str_starts_with($profile->catalyst_id, 'id.catalyst://')) {
                    continue;
                }

                try {
                    $content = str_replace('id.catalyst://', '', $profile->catalyst_id);
                    $parts = explode('/', $content);
                    $userInfo = $parts[0] ?? null;

                    if ($userInfo) {
                        $userParts = explode('@', $userInfo);
                        $rawUsername = $userParts[0] ?? null;

                        if ($rawUsername) {
                            $cleanUsername = urldecode($rawUsername);
                            $profile->update([
                                'username' => $cleanUsername
                            ]);
                        }
                    }
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning("Failed to parse username for profile {$profile->id}: " . $e->getMessage());
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('catalyst_profiles', function (Blueprint $table) {
            //
        });
    }
};
