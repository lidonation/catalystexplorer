<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class RecentlyVisitedListData extends Data
{
    public function __construct(
        public string $id,

        public string $title,

        public string $slug,

        #[TypeScriptOptional]
        public ?string $fund_label,

        public int $visited_at,

        public int $visit_count,
    ) {}
}
