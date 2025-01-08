<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\User;
use Database\Seeders\Traits\GetImageLink;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    use GetImageLink;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Announcement::factory()
            ->count(20)
            ->recycle(User::all())
            ->create()
            ->each(function (Announcement $announcement) {
                if ($imageLink = $this->getRandomImageLink()) {
                    $announcement->addMediaFromUrl($imageLink)->toMediaCollection('hero_image');
                }
            });
    }
}
