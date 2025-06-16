<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Attributes\WithCast;
use Spatie\LaravelData\Casts\DateTimeInterfaceCast;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class KeyValueStoreData extends Data
{
    public function __construct(
        public string $id,

        public string $key,

        public string $value,

        #[TypeScriptOptional, WithCast(DateTimeInterfaceCast::class, format: 'c')]
        public ?string $updated_at = null,
    ) {}
}