<?php

namespace Database\Factories;

use App\Models\Nft;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Meta>
 */
class MetaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'key' => $this->faker->word,
            'content' => $this->faker->word,
            'model_type' => Nft::class,
        ];
    }

    /**
     * Create meta for NMKR project UUID
     */
    public function nmkrProjectUid(): static
    {
        return $this->state(fn (array $attributes) => [
            'key' => 'nmkr_project_uid',
            'content' => $this->faker->uuid,
        ]);
    }

    /**
     * Create meta for NMKR NFT UUID
     */
    public function nmkrNftUuid(): static
    {
        return $this->state(fn (array $attributes) => [
            'key' => 'nmkr_nftuid',
            'content' => $this->faker->uuid,
        ]);
    }

    /**
     * Create meta for NMKR metadata (the 721 standard metadata)
     */
    public function nmkrMetadata(array $metadata = []): static
    {
        $nmkrMetadata = [
            '721' => [
                'version' => '1.0',
                'test_policy_id' => [
                    'test_asset_name' => [
                        'projectTitle' => 'Test Project',
                        'projectCatalystCampaignName' => 'Test Campaign',
                        'role' => 'Proposer',
                        'yesVotes' => '100',
                        'noVotes' => '50'
                    ]
                ]
            ]
        ];

        if (!empty($metadata)) {
            $nmkrMetadata['721']['test_policy_id']['test_asset_name'] = array_merge(
                $nmkrMetadata['721']['test_policy_id']['test_asset_name'],
                $metadata
            );
        }

        return $this->state(fn (array $attributes) => [
            'key' => 'nmkr_metadata',
            'content' => json_encode($nmkrMetadata, JSON_UNESCAPED_SLASHES),
        ]);
    }

    /**
     * Create meta with specific key and content
     */
    public function withKeyContent(string $key, string $content): static
    {
        return $this->state(fn (array $attributes) => [
            'key' => $key,
            'content' => $content,
        ]);
    }
}