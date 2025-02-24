<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class IdeascaleProfileData extends Data
{
    public function __construct(
        public ?string $hash,

        #[TypeScriptOptional]
        public ?int $ideascaleId,

        #[TypeScriptOptional]
        public ?string $username,

        #[TypeScriptOptional]
        public ?string $email,

        #[TypeScriptOptional]
        public ?string $name,

        #[TypeScriptOptional]
        public string|array|null $bio,

        #[TypeScriptOptional]
        public ?string $createdAt,

        #[TypeScriptOptional]
        public ?string $updatedAt,

        #[TypeScriptOptional]
        public ?string $twitter,

        #[TypeScriptOptional]
        public ?string $linkedin,

        #[TypeScriptOptional]
        public ?string $discord,

        #[TypeScriptOptional]
        public ?string $ideascale,

        #[TypeScriptOptional]
        public ?int $claimedBy,

        #[TypeScriptOptional]
        public ?string $telegram,

        #[TypeScriptOptional]
        public ?string $title,

        #[TypeScriptOptional]
        public ?string $hero_img_url,

        #[TypeScriptOptional]
        public ?int $amount_awarded_usd,

        #[TypeScriptOptional]
        public ?int $amount_awarded_ada,

        #[TypeScriptOptional]
        public ?float $amount_requested_ada,

        #[TypeScriptOptional]
        public ?float $amount_requested_usd,

        #[TypeScriptOptional]
        public ?float $amount_distributed_ada,

        #[TypeScriptOptional]
        public ?float $amount_distributed_usd,

        #[TypeScriptOptional]
        public ?int $co_proposals_count,

        #[TypeScriptOptional]
        public ?int $own_proposals_count,

        #[TypeScriptOptional]
        public ?int $claimed_by,

        #[TypeScriptOptional]
        public ?int $completed_proposals_count,

        #[TypeScriptOptional]
        public ?int $funded_proposals_count,

        #[TypeScriptOptional]
        public ?int $unfunded_proposals_count,

        #[TypeScriptOptional]
        public ?int $proposals_count,

        #[TypeScriptOptional]
        public ?int $collaborating_proposals_count,
    ) {}
}
