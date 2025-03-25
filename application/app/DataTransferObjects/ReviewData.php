<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class ReviewData extends Data
{
    public function __construct(
        public ?string $hash,

        #[TypeScriptOptional]
        public ?int $parent_id,

        #[TypeScriptOptional]
        public ?string $title,

        public ?string $content,

        public ?string $status,

        public ?int $rating,

        public ?ReviewerData $reviewer,

        public ?string $type,

        public ?int $ranking_total,

        public ?int $helpful_total,

        public ?int $not_helpful_total,
    ) {}
}
