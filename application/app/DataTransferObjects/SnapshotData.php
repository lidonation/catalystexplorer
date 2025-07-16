<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class SnapshotData extends Data
{
    public function __construct(
        public ?string $hash,

        #[TypeScriptOptional]
        public int $epoch,

        #[TypeScriptOptional]
        public int $order,

        #[TypeScriptOptional]
        public ?FundData $fund,

    ) {}
}
