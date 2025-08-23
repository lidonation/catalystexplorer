<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\User;
use Database\Seeders\Traits\GetImageLink;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AnnouncementSeeder extends Seeder
{
    use GetImageLink;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (User::count() === 0) {
            User::factory()->count(5)->create();
        }

        $this->ensureUsersHaveOldIds();

        $users = User::whereNotNull('old_id')->get();

        for ($i = 0; $i < 20; $i++) {
            $randomUser = $users->random();
            
            $announcementId = DB::table('announcements')->insertGetId([
                'id' => Str::uuid(),
                'title' => fake()->sentence(),
                'content' => fake()->paragraph(),
                'label' => fake()->word(),
                'context' => fake()->randomElement(['home', 'proposal', 'special', null]),
                'event_starts_at' => fake()->dateTimeBetween('now', '+1 week'),
                'event_ends_at' => fake()->dateTimeBetween('+1 week', '+2 weeks'),
                'user_id' => $randomUser->old_id,
                'cta' => json_encode([
                    fake()->word() => fake()->url(),
                    fake()->word() => fake()->url(),
                    fake()->word() => fake()->url(),
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ], 'id');

            if ($i < 5) { // Add images to first 5 announcements
                if ($imageLink = $this->getRandomImageLink()) {
                    $announcement = Announcement::find($announcementId);
                    if ($announcement) {
                        $announcement->addMediaFromUrl($imageLink)->toMediaCollection('hero_image');
                    }
                }
            }
        }
    }

    private function ensureUsersHaveOldIds(): void
    {
        $usersWithoutOldId = User::whereNull('old_id')->get();
        
        $maxOldId = User::max('old_id') ?? 0;
        $currentId = $maxOldId + 1;
        
        foreach ($usersWithoutOldId as $user) {
            $user->update(['old_id' => $currentId]);
            $currentId++;
        }
    }
}