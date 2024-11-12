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
        public ?array $bio,

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
        public ?string $deleted_at
    ) {}
}
