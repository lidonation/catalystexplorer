<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class CommentData extends Data
{
    public function __construct(
        public string $id,
        public string $text,
        public ?string $original_text,
        public string $created_at,
        public ?int $parent_id,
        public string $updated_at,
        public ?UserData $commentator,
        #[DataCollectionOf(CommentData::class)]
        public ?DataCollection $nested_comments,
    ) {}
}
