<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Link;
use Illuminate\Database\Seeder;

class LinkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Link::create([
            'type' => 'type1',
            'link' => 'https://www.google.com',
            'label' => 'Google',
            'title' => 'Search Engine',
            'status' => 'published',
            'order' => 1,
            'valid' => true,
        ]);

        Link::factory(55)
            ->create();
    }
}
