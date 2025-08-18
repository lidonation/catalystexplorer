<?php

namespace Database\Factories;

use App\Models\Meta;
use App\Models\Nft;
use App\Models\User;
use App\Enums\NftStatusEnum;
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
        $user = User::inRandomOrder()->first();
        $artistId = $user ? $user->old_id : 1;
        $profile = IdeascaleProfile::inRandomOrder()->first();
        $modelId = $profile ? $profile->id : (string) Str::uuid(); // fallback to random UUID

         return [
            'name' => [
                'en' => $this->faker->words(3, true),
            ],
            'description' => [
                'en' => $this->faker->paragraph(),
            ],
            'artist_id' => $artistId,
            'artist_uuid' => $user?->id,
            'user_id' => $artistId,
            'user_uuid' => $user?->id,
            'model_type' => 'App\Models\IdeascaleProfile',
            'model_id' => $modelId,
            'status' => 'draft',
            'metadata' => [
                'project_title' => $this->faker->words(3, true),
                'campaign_name' => $this->faker->words(2, true),
                'role' => 'Proposer',
            ],
            'policy' => $this->faker->regexify('[a-f0-9]{56}'),
            'fingerprint' => 'asset1' . $this->faker->regexify('[a-z0-9]{38}'),
            'preview_link' => $artLink,
            'storage_link' => $artLink,
        ];
    }

    /**
     * Configure the factory after model creation
     */
    public function configure()
    {
        return $this;
    }

    public function minted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'minted',
            'minted_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ]);
    }

    public function withMetadata(string $policyId = null, string $assetName = null, array $attributes = []): static
    {
        return $this->state(function (array $state) use ($policyId, $assetName, $attributes) {
            $faker = $this->faker;

            $policyId = $policyId ?? $faker->regexify('[a-f0-9]{56}');
            $assetName = $assetName ?? $faker->slug;

            return [
                'policy' => $policyId,
                'fingerprint' => 'asset1' . $faker->regexify('[a-z0-9]{38}'),
                'metadata' => [
                    '721' => [
                        $policyId => [
                            $assetName => $attributes + [
                                'projectTitle' => $faker->words(3, true),
                                'projectCatalystCampaignName' => $faker->words(2, true),
                                'role' => 'Proposer',
                                'yesVotes' => (string) $faker->numberBetween(50, 500),
                                'noVotes' => (string) $faker->numberBetween(10, 100),
                            ]
                        ],
                        'version' => '1.0',
                    ]
                ],
            ];
        });
    }

    /**
     * Create NFT with NMKR project UUID
     */
    public function withNmkrProjectUuid(string $uuid = null): static
    {
        return $this->afterCreating(function (Nft $nft) use ($uuid) {
            $projectUuid = $uuid ?? $this->faker->uuid;
            
            Meta::factory()
                ->withKeyContent('nmkr_project_uid', $projectUuid)
                ->create([
                    'model_type' => Nft::class,
                    'model_id' => $nft->id,
                ]);
        });
    }

    /**
     * Create NFT with NMKR NFT UUID
     */
    public function withNmkrNftUuid(string $uuid = null): static
    {
        return $this->afterCreating(function (Nft $nft) use ($uuid) {
            $nftUuid = $uuid ?? $this->faker->uuid;
            
            Meta::factory()
                ->withKeyContent('nmkr_nftuid', $nftUuid)
                ->create([
                    'model_type' => Nft::class,
                    'model_id' => $nft->id,
                ]);
        });
    }

    /**
     * Create NFT with NMKR metadata (721 standard)
     */
    public function withNmkrMetadata(array $metadata = []): static
    {
        return $this->afterCreating(function (Nft $nft) use ($metadata) {
            Meta::factory()
                ->nmkrMetadata($metadata)
                ->create([
                    'model_type' => Nft::class,
                    'model_id' => $nft->id,
                ]);
        });
    }

    /**
     * Create NFT with both NMKR UUIDs
     */
    public function withNmkrUuids(string $projectUuid = null, string $nftUuid = null): static
    {
        return $this->afterCreating(function (Nft $nft) use ($projectUuid, $nftUuid) {
            // Create project UUID meta
            Meta::factory()
                ->withKeyContent('nmkr_project_uid', $projectUuid ?? $this->faker->uuid)
                ->create([
                    'model_type' => Nft::class,
                    'model_id' => $nft->id,
                ]);

            // Create NFT UUID meta
            Meta::factory()
                ->withKeyContent('nmkr_nftuid', $nftUuid ?? $this->faker->uuid)
                ->create([
                    'model_type' => Nft::class,
                    'model_id' => $nft->id,
                ]);
        });
    }

    /**
     * Create NFT with custom meta data
     */
    public function withMeta(array $metaData): static
    {
        return $this->afterCreating(function (Nft $nft) use ($metaData) {
            foreach ($metaData as $key => $content) {
                Meta::factory()
                    ->withKeyContent($key, $content)
                    ->create([
                        'model_type' => Nft::class,
                        'model_id' => $nft->id,
                    ]);
            }
        });
    }
}