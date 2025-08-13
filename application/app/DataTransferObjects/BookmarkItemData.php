<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Enums\VoteEnum;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class BookmarkItemData extends Data
{
    public function __construct(
        public ?string $id,

        #[TypeScriptOptional]
        public ?string $user_id,

        #[TypeScriptOptional]
        public ?int $bookmark_collection_id,

        #[TypeScriptOptional]
        public ?int $model_id,

        #[TypeScriptOptional]
        public ProposalData|ReviewData|IdeascaleProfileData|CommunityData|GroupData $model,

        #[TypeScriptOptional]
        public ?string $model_type,

        #[TypeScriptOptional]
        public ?string $title,

        #[TypeScriptOptional]
        public ?string $content,

        #[TypeScriptOptional]
        public ?int $action,

        #[TypeScriptOptional]
        public ?VoteEnum $vote,

        #[TypeScriptOptional]
        public ?string $created_at,

        #[TypeScriptOptional]
        public ?string $updated_at,

        #[TypeScriptOptional]
        public ?string $deleted_at
    ) {}
}
