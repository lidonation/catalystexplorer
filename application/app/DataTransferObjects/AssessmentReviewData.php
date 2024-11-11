<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class AssessmentReviewData extends Data
{
    public function __construct(
        public ?int $id,

        #[TypeScriptOptional]
        public ?int $assessor_id,

        public int $excellent_count,

        public int $good_count,

        public int $filtered_out_count,

        public bool $flagged,

        #[TypeScriptOptional]
        public ?array $qa_rationale,

    ) {}
}
