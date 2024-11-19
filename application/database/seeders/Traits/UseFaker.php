<?php

declare(strict_types=1);

namespace Database\Seeders\Traits;

use Faker\Generator;
use Illuminate\Container\Container;

trait UseFaker
{
    /**
     * Get a new Faker instance.
     *
     * @return \Faker\Generator
     */
    public function withFaker()
    {
        return Container::getInstance()->make(Generator::class);
    }
}
