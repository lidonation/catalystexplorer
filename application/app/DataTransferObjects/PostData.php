<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Attributes\WithCast;
use Spatie\LaravelData\Casts\DateTimeInterfaceCast;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class PostData extends Data
{
    public function __construct(
        public ?int $id,

        public ?string $title,

        public ?string $subtitle,

        public ?string $summary,

        public mixed $hero,

        public ?string $author_gravatar,

        public ?string $author_name,

        public string $link,

        public ?string $read_time,

        public ?string $type,

        #[TypeScriptOptional, WithCast(DateTimeInterfaceCast::class, format: 'Y-m-d H:i:s')]
        public ?\DateTime $published_at,
    ) {}
}
