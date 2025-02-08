<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class GroupData extends Data
{
    public function __construct(
        public ?int $id,

        #[TypeScriptOptional]
        public ?int $user_id,

        #[TypeScriptOptional]
        public ?string $name,

        #[TypeScriptOptional]
        public ?string $bio,

        #[TypeScriptOptional]
        public ?string $profile_photo_url,

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
        public ?string $created_at,

        #[TypeScriptOptional]
        public ?string $updated_at,

        #[TypeScriptOptional]
        public ?string $deleted_at,

        #[TypeScriptOptional]
        public ?int $proposals_count,

        #[TypeScriptOptional]
        public ?int $proposals_funded,

        #[TypeScriptOptional]
        public ?array $proposals,

        #[TypeScriptOptional]
        public ?float $amount_awarded_ada,

        #[TypeScriptOptional]
        public ?float $amount_awarded_usd,

        #[TypeScriptOptional]
        public ?float $amount_distributed_ada,

        #[TypeScriptOptional]
        public ?float $amount_distributed_usd,

        #[TypeScriptOptional]
        public ?array $ideascale_profiles,

    ) {}
}
