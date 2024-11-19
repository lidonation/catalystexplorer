<?php declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Attributes\WithCast;
use Spatie\LaravelData\Casts\DateTimeInterfaceCast;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class MetricData extends Data
{
    public function __construct(
        public ?int $user_id,

        public string $title,

        #[TypeScriptOptional]
        public ?string $content,

        #[TypeScriptOptional]
        public ?string $status,

        #[TypeScriptOptional, WithCast(DateTimeInterfaceCast::class, format: 'd/m/Y')]
        public ?\DateTime $created_at,

        #[TypeScriptOptional, WithCast(DateTimeInterfaceCast::class, format: 'd/m/Y')]
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
        public ?int $value,

        #[TypeScriptOptional]
        public ?int $order
    ) {}
}
