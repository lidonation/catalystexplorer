<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CampaignData extends Data
{
    public function __construct(
        public ?int $id,

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

        #[TypeScriptOptional]
        public ?float $amount,

        public ?string $created_at,

        public ?string $updated_at,

        #[TypeScriptOptional]
        public ?string $label,

        #[TypeScriptOptional]
        public ?string $total_requested,

        #[TypeScriptOptional]
        public ?string $total_awarded,

        #[TypeScriptOptional]
        public ?string $total_distributed,

        #[TypeScriptOptional]
        public ?string $currency,

<<<<<<< HEAD
        public ?int $proposals_count,

        public ?int $unfunded_proposals_count,
        
        public ?int $funded_proposals_count,
        
        public ?int $completed_proposals_count
=======
        #[TypeScriptOptional]
        public ?int $proposals_count,

        #[TypeScriptOptional]
        public ?int $completed_proposals_count,

        #[TypeScriptOptional]
        public ?int $unfunded_proposals,

        #[TypeScriptOptional]
        public ?int $funded_proposals,
>>>>>>> ef37c41f0da86cfc949d25ab279ac5e2131bb6b8
    ) {}
}
