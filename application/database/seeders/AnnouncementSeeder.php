<?php declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Announcement;
use Illuminate\Database\Seeder;
use Database\Seeders\Traits\GetImageLink;

class AnnouncementSeeder extends Seeder
{
    use GetImageLink;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $userIds = \App\Models\User::pluck('id');

        Announcement::factory(20)->create()->each(function (Announcement $announcement) use ($userIds) {
            $announcement->user_id = $userIds->random();
            $announcement->save();

            if ($imageLink = $this->getRandomImageLink()) {
                $announcement->addMediaFromUrl($imageLink)->toMediaCollection('hero_image');
            }
        });
    }
}
