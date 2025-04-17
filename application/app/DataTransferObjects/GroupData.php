<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class GroupData extends Data
{
    public function __construct(
        public ?string $hash,

        #[TypeScriptOptional]
        public ?int $user_id,

        #[TypeScriptOptional]
        public ?string $name,

        #[TypeScriptOptional]
        public ?string $hero_img_url,

        #[TypeScriptOptional]
        public array|string|null $bio,

        #[TypeScriptOptional]
        public ?string $banner_img_url,

        #[TypeScriptOptional]
        public ?string $slug,

        #[TypeScriptOptional]
        public ?string $status,

        #[TypeScriptOptional]
        public ?string $meta_title,

        #[TypeScriptOptional]
        public ?string $website,

        #[TypeScriptOptional]
        public ?string $twitter,

        #[TypeScriptOptional]
        public ?string $discord,

        #[TypeScriptOptional]
        public ?string $github,

        #[TypeScriptOptional]
        public ?string $linkedin,

        #[TypeScriptOptional]
        public ?string $created_at,

        #[TypeScriptOptional]
        public ?string $updated_at,

        #[TypeScriptOptional]
        public ?string $deleted_at,

        #[TypeScriptOptional]
        public ?float $amount_awarded_ada,

        #[TypeScriptOptional]
        public ?float $amount_awarded_usd,

        #[TypeScriptOptional]
        public ?float $amount_requested_ada,

        #[TypeScriptOptional]
        public ?float $amount_requested_usd,

        #[TypeScriptOptional]
        public ?float $amount_distributed_ada,

        #[TypeScriptOptional]
        public ?float $amount_distributed_usd,

        #[TypeScriptOptional]
        public ?int $proposals_count,

        #[TypeScriptOptional]
        public ?int $completed_proposals_count,

        #[TypeScriptOptional]
        public ?int $funded_proposals_count,

        #[TypeScriptOptional]
        public ?int $unfunded_proposals_count,

        #[TypeScriptOptional]
        public ?int $proposals_funded,

        #[TypeScriptOptional]
        public ?int $proposals_unfunded,

        #[TypeScriptOptional]
        public ?int $proposals_completed,

        #[TypeScriptOptional]
        #[DataCollectionOf(IdeascaleProfileData::class)]
        public ?DataCollection $ideascale_profiles,

        #[TypeScriptOptional]
        public ?int $reviews_count
    ) {}
}
