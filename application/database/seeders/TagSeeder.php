<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Tag;
use App\Models\Proposal;
use Illuminate\Support\Arr;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Tag::factory()->count(20)->create()->each(function ($tag) {
            $proposals = Proposal::inRandomOrder()->take(Arr::random([2, 3, 4, 5, 10, 7, 8]))->get();
            $tag->proposals()->attach($proposals->pluck('id'));
        });
    }
}
