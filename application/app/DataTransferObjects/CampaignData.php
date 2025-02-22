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
        public ?string $hash,

        #[TypeScriptOptional]
        public ?int $fund_id,

        public ?string $title,

        public ?string $meta_title,

        public ?string $slug,
        #[TypeScriptOptional]
        public ?string $excerpt,

        #[TypeScriptOptional]
        public ?string $comment_prompt,

        #[TypeScriptOptional]
        public ?string $content,

        public ?float $amount,

        public ?string $created_at,

        public ?string $updated_at,

        #[TypeScriptOptional]
        public ?string $label,

        public string $currency,

        public int $proposals_count,

        public ?int $unfunded_proposals_count,

        public ?int $funded_proposals_count,

        public ?int $completed_proposals_count,

        #[MapInputName('totalRequested')]
        public ?float $total_requested,

        #[MapInputName('totalAwarded')]
        public ?float $total_awarded,

        #[MapInputName('totalDistributed')]
        public ?float $total_distributed,
    ) {}
}
