<?php

declare(strict_types=1);

namespace Database\Seeders\Traits;

use Faker\Generator;
use Illuminate\Container\Container;


trait GetImageLink
{


    public function getRandomImageLink(): null|string
    {
        $faker = $this->withFaker();
        
        $url = "https://i.pravatar.cc/300?img={$faker->numberBetween(1, 50)}";

        $headers = get_headers($url, true);

        if ($headers && isset($headers['Content-Type']) && str_contains($headers['Content-Type'], 'image')) {
            return $url;
        }

        return null;
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
