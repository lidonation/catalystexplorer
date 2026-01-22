<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CatalystProfileData extends Data
{
    public function __construct(
        #[TypeScriptOptional]
        public ?string $id,

        #[TypeScriptOptional]
        public ?string $name,

        #[TypeScriptOptional]
        public ?string $username,

        #[TypeScriptOptional]
        public ?string $claimed_by,

        #[TypeScriptOptional]
        public ?string $catalyst_id,

        #[TypeScriptOptional]
        public ?string $hero_img_url,

        #[TypeScriptOptional]
        public ?string $bio,

        #[TypeScriptOptional]
        public ?string $twitter,

        #[TypeScriptOptional]
        public ?string $linkedin,

        #[TypeScriptOptional]
        public ?string $discord,

        #[TypeScriptOptional]
        public ?int $completed_proposals_count,

        #[TypeScriptOptional]
        public ?int $funded_proposals_count,

        #[TypeScriptOptional]
        public ?int $proposals_count,

        #[TypeScriptOptional]
        public ?int $own_proposals_count,

        #[TypeScriptOptional]
        public ?int $collaborating_proposals_count,

        #[TypeScriptOptional]
        public ?float $amount_requested_ada,

        #[TypeScriptOptional]
        public ?float $amount_requested_usd,

        #[TypeScriptOptional]
        public ?float $amount_awarded_ada,

        #[TypeScriptOptional]
        public ?float $amount_awarded_usd,

        #[TypeScriptOptional]
        public ?float $amount_distributed_ada,

        #[TypeScriptOptional]
        public ?float $amount_distributed_usd,

        #[TypeScriptOptional]
        public mixed $groups = null,

        #[DataCollectionOf(
            ClaimedProfileData::class
        )]
        public ?DataCollection $claimed_profiles,
    ) {}
}
