<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class MilestonePoasReviewData extends Data
{
    public function __construct(

        public string $id,

        public bool $content_approved,

        public string $content_comment,

        public string $role,

        public string $created_at,

        public string $user_id,

        public bool $current

    ) {}
}
