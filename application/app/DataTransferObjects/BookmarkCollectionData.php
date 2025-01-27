<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class BookmarkCollectionData extends Data
{
    public function __construct(
        public ?int $id,

        #[TypeScriptOptional]
        public ?int $user_id,

        #[TypeScriptOptional]
        public ?int $parent_id,

        #[TypeScriptOptional]
        public ?string $title,

        #[TypeScriptOptional]
        public ?string $content,

        #[TypeScriptOptional]
        public ?string $color,

        #[TypeScriptOptional]
        public ?string $allow_comments,

        #[TypeScriptOptional]
        public ?string $visibility,

        #[TypeScriptOptional]
        public ?string $status,

        #[TypeScriptOptional]
        public ?string $type,

        #[TypeScriptOptional]
        public ?int $type_id,

        #[TypeScriptOptional]
        public ?string $type_type,

        #[TypeScriptOptional]
        public ?string $created_at,

        #[TypeScriptOptional]
        public ?string $updated_at,

        #[TypeScriptOptional]
        public ?string $deleted_at
    ) {}
}
