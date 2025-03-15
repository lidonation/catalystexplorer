<?php

namespace Database\Factories;

use App\Models\User;
use App\Enums\StatusEnum;
use Illuminate\Support\Str;
use App\Models\IdeascaleProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Nft>
 */
class NftFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $links = [
            'https://www.lidonation.com/storage/8576/conversions/YMzVGghJ3P3mysydqyWtTAd1DG96MJFSlj_Y5EQ9zEs-preview-preview.jpg',
            'https://www.lidonation.com/storage/8630/conversions/CLiBxvqVaRrq2LBSVLvvc_ac8wij-Femw7zPCAmlSIY-preview.jpg',
            'https://www.lidonation.com/storage/8646/conversions/I1sHE9r_LiRWiDDw2k5q_f-YewtpX78A-TRy-tPtnA8-preview.jpg',
            'https://www.lidonation.com/storage/8604/conversions/VabvoAuipr1MrFT8n2jrZC5tqkXH3zqcdZzHy1sgYd0-preview.jpg',
            'https://uosrtegasehfb4ga62ukujphhfkg7hpyiw7utitckmftzhlnqviq.arweave.net/o6UZkMCRDlDwwPaoqiXnOVRvnfhFv0miYlMLPJ1thVE',
            'https://www.lidonation.com/storage/8640/conversions/HYNsiUGuB9lAdY8z3rVJ777Uxh2dOC_C9XQ7ULFljRc-preview.jpg',
            'https://www.lidonation.com/storage/8655/conversions/y4T9-7szu_dfSj4zUUI3zY0cH-bvabai5vTFDcUq_vo-preview.jpg',
            'https://www.lidonation.com/storage/8610/conversions/yzVK3sFPHiTvn-ABKKRDANcTFGbR6AjAxnKIF7cYGFk-preview.jpg'
        ];
        $artLink = $this->faker->randomElement($links);

        return [
            'name' => $this->faker->words(1, true),
            'user_id' => User::factory(),
            'artist_id' => User::factory(),
            'model_id' => IdeascaleProfile::inRandomOrder()->first()?->id ?? IdeascaleProfile::factory(),
            'model_type' => IdeascaleProfile::class,
            'storage_link' => $artLink,
            'preview_link' => $artLink,
            'policy' => 'f3b85a24dbf28b5030a4b1caed7be4480df6754e3cb019a30da8d57f',
            'price' => 0 ,
            'description' => 'Completed Projects mint custom Completion NFTs via NMKR API & LidoNation Catalyst Explorer. Minting a completion NFT is a celebration, a ceremony, a shareable trackable community artifact. Art by Stephanie King.',
            'rarity' => $this->faker->randomElement(['common', 'rare', 'legendary']),
            'status' => $this->faker->randomElement(StatusEnum::toArray()),
            'metadata' => [
                "name" => "Project Catalyst Completion NFT: 55566",
                "Fund" => "Fund". $this->faker->numberBetween(1, 2),
                "campaign_name" => "Cardano Open: Developers",
                "project_title" => "CCC: Cardano Multiversity MVP",
                "budget" => $this->faker->numberBetween(50000, 350000),
                "Funded Project Number" => $this->faker->numberBetween(50000, 350000),
                "yes_votes" => $this->faker->numberBetween(5000000, 35000000),
                "no_votes" => $this->faker->numberBetween(2000000, 3000000),
                "role" => $this->faker->randomElement(['member', 'author'])
            ],
        ];
    }
}
