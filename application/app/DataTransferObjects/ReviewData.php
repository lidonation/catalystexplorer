<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class ReviewData extends Data
{
    public function __construct(
        public ?string $id,

        #[TypeScriptOptional]
        public ?int $parent_id,

        #[TypeScriptOptional]
        public ?string $title,

        public ?string $content,

        public ?string $status,

        public int|RatingData|null $rating,

        public ?ProposalData $proposal,

        public ?ReviewerData $reviewer,

        public ?int $ranking_total,

        public ?int $positive_rankings,

        public ?int $negative_rankings,
    ) {}
}
