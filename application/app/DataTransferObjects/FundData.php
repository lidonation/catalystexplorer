<?php

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Attributes\WithCast;
use Spatie\LaravelData\Casts\DateTimeInterfaceCast;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class FundData extends Data
{
    public function __construct(
        public ?int $user_id,

        public string $title,
        public string $meta_title,
        public string $slug,

        #[TypeScriptOptional]
        public ?string $excerpt,

        #[TypeScriptOptional]
        public ?string $comment_prompt,

        #[TypeScriptOptional]
        public ?string $content,

        public float $amount,

        #[TypeScriptOptional]
        public ?string $status,

        #[TypeScriptOptional, WithCast(DateTimeInterfaceCast::class, format: 'Y-m-d H:i:s')]
        public ?\DateTime $launched_at,

        #[TypeScriptOptional, WithCast(DateTimeInterfaceCast::class, format: 'Y-m-d H:i:s')]
        public ?\DateTime $awarded_at,

        #[TypeScriptOptional]
        public ?string $color,

        #[TypeScriptOptional]
        public ?string $label,

        public string $currency,

        #[TypeScriptOptional, WithCast(DateTimeInterfaceCast::class, format: 'Y-m-d H:i:s')]
        public ?\DateTime $assessment_started_at,

        #[TypeScriptOptional]
        public ?int $parent_id
    ) {}
}
