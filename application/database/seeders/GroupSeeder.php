<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Group;
use Database\Seeders\Traits\GetImageLink;
use Illuminate\Database\Seeder;

class GroupSeeder extends Seeder
{
    use GetImageLink;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $groups = Group::factory()
            ->count(10)
            ->create();

        $groups->each(function (Group $group) {
            if ($heroImageLink = $this->getRandomBannerImageLink()) {
                $group->addMediaFromUrl($heroImageLink)->toMediaCollection('banner');
            }

            if ($logoImageLink = $this->getGroupInitialsLogoLink($group->name)) {
                $group->addMediaFromUrl($logoImageLink)->toMediaCollection('hero');
            }
        });
    }
}
