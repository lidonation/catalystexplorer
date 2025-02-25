<?php

declare(strict_types=1);

namespace Database\Seeders\Traits;

use Faker\Generator;
use Illuminate\Container\Container;

trait GetImageLink
{
    public function getRandomImageLink(): ?string
    {
        $faker = $this->withFaker();

        $url = "https://i.pravatar.cc/300?img={$faker->numberBetween(1, 50)}";

        $headers = get_headers($url, true);

        if ($headers && isset($headers['Content-Type']) && str_contains($headers['Content-Type'], 'image')) {
            return $url;
        }

        return null;
    }

    public function getRandomBannerImageLink(): ?string
    {
        $faker = $this->withFaker();
        $width = 1920;
        $height = 480;

        $url = "https://picsum.photos/id/{$faker->numberBetween(1, 70)}//{$width}/{$height}";

        $headers = get_headers($url, true);

        if ($headers && isset($headers['Content-Type']) && str_contains($headers['Content-Type'], 'image')) {
            return $url;
        }

        return null;
    }

    public function getGroupInitialsLogoLink(string $groupName): string
    {
        $words = explode(' ', $groupName);
        $initials = '';
        foreach ($words as $word) {
            if (strlen($word) > 0 && strlen($initials) < 2) {
                $initials .= strtoupper(substr($word, 0, 1));
            }
        }

        if (strlen($initials) < 2 && strlen($groupName) > 0) {
            $initials = str_pad($initials, 2, strtoupper(substr($groupName, 0, 1)));
        }

        $faker = $this->withFaker();
        $colorSeed = crc32($groupName);
        $faker->seed($colorSeed);
        $bgColor = substr(hash('sha256', $groupName), 0, 6);

        return 'https://ui-avatars.com/api/?'
            .'name='.urlencode($initials)
            .'&size=300'
            .'&background='.$bgColor
            .'&color=ffffff'
            .'&bold=true';
    }

    /**
     * Get a new Faker instance.
     *
     * @return \Faker\Generator
     */
    protected function withFaker()
    {
        return Container::getInstance()->make(Generator::class);
    }
}
