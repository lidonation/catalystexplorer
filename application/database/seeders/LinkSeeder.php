<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Link;

class LinkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        Link::create([
            'type' => 'external',
            'link' => 'https://www.google.com',
            'label' => 'Google',
            'title' => 'Google Search',
            'status' => 'published',
            'order' => 1,
            'valid' => true,
            'uri' => 'https://www.google.com',
            'model_id' => 1,
            'model_type' => 'App\Models\Link',
        ]);

        Link::factory(55)->create();
    }
}

