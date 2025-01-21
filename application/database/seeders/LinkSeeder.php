<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
            'uri' => 'https:://www.google.com',
            'model_id' => 1,
            'model_type' => 'App\Models\Link',
        ]);
    }
}
