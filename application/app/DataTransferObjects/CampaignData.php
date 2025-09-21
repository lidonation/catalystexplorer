<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CampaignData extends Data
{
    public function __construct(
        public ?string $id,

        #[TypeScriptOptional]
        public ?string $fund_id,

        public ?string $title,

        public ?string $meta_title,

        public ?string $slug,
        #[TypeScriptOptional]
        public ?string $excerpt,

        #[TypeScriptOptional]
        public ?string $comment_prompt,

        #[TypeScriptOptional]
        public ?string $content,

        #[TypeScriptOptional]
        public ?string $hero_img_url,

        public ?float $amount,

        public ?string $created_at,

        public ?string $updated_at,

        #[TypeScriptOptional]
        public ?string $label,

        public ?string $currency,

        public ?int $proposals_count,

        public ?int $unfunded_proposals_count,

        public ?int $funded_proposals_count,

        public ?int $completed_proposals_count,

        #[MapInputName('totalRequested')]
        public ?float $total_requested,

        #[MapInputName('totalAwarded')]
        public ?float $total_awarded,

        #[MapInputName('totalDistributed')]
        public ?float $total_distributed,

        public ?FundData $fund,
    ) {}

    /**
     * Create a CampaignData instance with safe null handling
     * This helps avoid strict type issues when data has null IDs
     */
    public static function fromArraySafe(array $data): ?self
    {
        // If essential data is missing, return null instead of creating invalid object
        if (! isset($data['id']) && ! isset($data['title']) && ! isset($data['slug'])) {
            return null;
        }

        // Ensure ID is properly handled as nullable
        $data['id'] = $data['id'] ?? null;

        try {
            return static::from($data);
        } catch (\TypeError $e) {
            // Log the error for debugging but don't crash
            \Log::warning('CampaignData creation failed with TypeError', [
                'data' => $data,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
