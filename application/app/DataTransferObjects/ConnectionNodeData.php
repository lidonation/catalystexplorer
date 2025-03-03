<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class ConnectionNodeData extends Data
{
    public function __construct(
        public string $id,
        public string $type,
        public string $name,

        #[TypeScriptOptional]
        public ?string $hash,

        #[TypeScriptOptional]
        public ?string $photo,

        #[TypeScriptOptional]
        public ?int $val,

        #[TypeScriptOptional]
        public ?float $x,

        #[TypeScriptOptional]
        public ?float $y,
    ) {}
}
