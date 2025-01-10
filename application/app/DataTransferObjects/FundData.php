<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Attributes\WithCast;
use Spatie\LaravelData\Casts\DateTimeInterfaceCast;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class FundData extends Data
{
    public function __construct(

        public float $amount,
        public string $label,
        public string $title,

        #[TypeScriptOptional]
        public ?int $proposals_count,

        #[TypeScriptOptional]
        public ?int $funded_proposals_count,

        #[TypeScriptOptional]
        public ?int $completed_proposals_count,

        #[TypeScriptOptional]
        public ?int $amount_requested,

        #[TypeScriptOptional]
        public ?int $amount_awarded,

        #[TypeScriptOptional]
        public ?string $meta_title,

        #[TypeScriptOptional]
        public ?string $slug,

        #[TypeScriptOptional]
        public ?int $user_id,

        #[TypeScriptOptional]
        public ?string $excerpt,

        #[TypeScriptOptional]
        public ?string $comment_prompt,

        #[TypeScriptOptional]
        public ?string $content,

        #[TypeScriptOptional]
        public ?string $hero_img_url,

        #[TypeScriptOptional]
        public ?string $status,

        #[TypeScriptOptional, WithCast(DateTimeInterfaceCast::class, format: 'Y-m-d')]
        public ?string $launched_at,

        #[TypeScriptOptional, WithCast(DateTimeInterfaceCast::class, format: 'Y-m-d')]
        public ?string $awarded_at,

        #[TypeScriptOptional]
        public ?string $color,

        #[TypeScriptOptional]
        public ?string $currency,

        #[TypeScriptOptional, WithCast(DateTimeInterfaceCast::class, format: 'Y-m-d')]
        public ?string $review_started_at,

        #[TypeScriptOptional]
        public ?int $parent_id
    ) {}
}
