<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class RankingData extends Data
{
    public function __construct(
        #[TypeScriptOptional]
        public ?string $hash,

        #[TypeScriptOptional]
        public ?int $user_id,

        public int $model_id,

        public string $model_type,

        public int $value,
    ) {}
}
