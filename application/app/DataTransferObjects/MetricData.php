<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Attributes\MapOutputName;
use Spatie\LaravelData\Attributes\WithCast;
use Spatie\LaravelData\Casts\DateTimeInterfaceCast;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapOutputName(SnakeCaseMapper::class)]
final class MetricData extends Data
{
    public function __construct(
        public ?string $hash,

        public ?int $user_id,

        public string $title,

        #[TypeScriptOptional]
        public ?string $content,

        #[TypeScriptOptional]
        public ?string $status,

        #[TypeScriptOptional, WithCast(DateTimeInterfaceCast::class, format: 'Y-m-d')]
        public ?\DateTime $created_at,

        #[TypeScriptOptional, WithCast(DateTimeInterfaceCast::class, format: 'Y-m-d')]
        public ?\DateTime $updated_at,

        #[TypeScriptOptional]
        public ?string $color,

        #[TypeScriptOptional]
        public ?string $field,

        public string $type,

        public string $query,

        #[TypeScriptOptional]
        public ?string $count_by,

        #[TypeScriptOptional]
        public ?array $chartData,

        #[TypeScriptOptional]
        #[TypeScript('value')]
        #[MapOutputName('value')]
        public ?int $metric_value,

        #[TypeScriptOptional]
        public ?int $order
    ) {}
}
