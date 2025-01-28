<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class BookmarkItemData extends Data
{
    public function __construct(
        public ?int $id,

        #[TypeScriptOptional]
        public ?int $user_id,

        #[TypeScriptOptional]
        #[Nullable]
        public ?int $bookmark_collection_id,

        #[TypeScriptOptional]
        public ?int $model_id,

        #[TypeScriptOptional]
        public ?string $model_type,

        #[TypeScriptOptional]
        public ?string $title,

        #[TypeScriptOptional]
        public ?string $content,

        #[TypeScriptOptional]
        public ?int $action,

        #[TypeScriptOptional]
        public ?string $created_at,

        #[TypeScriptOptional]
        public ?string $updated_at,

        #[TypeScriptOptional]
        public ?string $deleted_at
    ) {}
}
