<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class MilestoneSomReviewsData extends Data
{
    public function __construct(

        public string $hash,

        public bool $outputs_approves,

        public string $outputs_comment,

        public bool $success_criteria_approves,

        public string $success_criteria_comment,

        public bool $evidence_approves,

        public string $evidence_comment,

        public bool $current,

        public string $role,

        public string $user_id,

        public string $created_at,

    ) {}
}
