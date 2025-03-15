<?php

namespace Database\Seeders;

use App\Models\Nft;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NftSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Nft::factory()->count(10)->create();
    }
}
