<?php

namespace Database\Seeders;

use App\Models\Nft;
use App\Models\Meta;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NftSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Nft::factory()
            ->withMeta([
                'nmkr_project_uid' => '123e4567-e89b-12d3-a456-426614174000',
                'nmkr_nftuid' => 'abcdef12-3456-7890-abcd-ef1234567890',
            ])
            ->afterCreating(function (Nft $nft) {
                Meta::factory()
                    ->nmkrMetadata()
                    ->create([
                        'model_type' => Nft::class,
                        'model_id' => $nft->id,
                    ]);
            })
            ->count(10)
            ->create();
    }
}