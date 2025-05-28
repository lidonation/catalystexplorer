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
        public ?string $hash,

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
        public ?bool $allow_comments,

        #[TypeScriptOptional]
        public ?string $visibility,

        #[TypeScriptOptional]
        public ?string $status,

        #[TypeScriptOptional]
        public ?string $type,

        #[TypeScriptOptional]
        public ?int $type_id,

        #[TypeScriptOptional]
        public ?int $items_count,

        #[TypeScriptOptional]
        public ?string $type_type,

        #[TypeScriptOptional]
        public ?string $created_at,

        #[TypeScriptOptional]
        public ?string $updated_at,

        #[TypeScriptOptional]
        public ?string $deleted_at,

        /**
         * @var object<string, mixed>
         */
        #[TypeScriptOptional]
        public $types_count,

        #[TypeScriptOptional]
        public ?int $proposals_count,

        #[TypeScriptOptional]
        public ?int $groups_count,

        #[TypeScriptOptional]
        public ?int $communities_count,

        #[TypeScriptOptional]
        public ?int $reviews_count,

        #[TypeScriptOptional]
        public ?int $comments_count,

        #[TypeScriptOptional]
        public ?int $amount_requested_USD,

        #[TypeScriptOptional]
        public ?int $amount_received_ADA,

        #[TypeScriptOptional]
        public ?int $amount_requested_ADA,

        #[TypeScriptOptional]
        public ?int $amount_received_USD,

        #[TypeScriptOptional]
        public ?UserData $author,
    ) {}
}
