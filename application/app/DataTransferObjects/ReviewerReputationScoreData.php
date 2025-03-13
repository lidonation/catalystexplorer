<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class ReviewerReputationScoreData extends Data
{
    public function __construct(
        public ?int $id,

        public int $reviewer_id,

        public int $score,

        #[TypeScriptOptional]
        public ?string $context_type,

        #[TypeScriptOptional]
        public ?int $context_id,

        #[TypeScriptOptional]
        public ?string $fund_name,
    ) {}
}
