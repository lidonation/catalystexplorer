<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class ConnectionData extends Data
{
    public function __construct(
        public ?string $hash,

        public ?string $rootGroupId,

        public ?string $rootGroupHash,

        public string $name,

        public array $nodes,

        public array $links
    ) {}
}
