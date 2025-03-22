<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Models\Reviewer;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class ReviewerData extends Data
{
    public function __construct(
        public ?int $id,
        public string $reviewr_id,

        #[TypeScriptOptional]
        public ?array $meta_info,
        #[TypeScriptOptional]
        public ?DataCollection $reputation_scores
    ) {}

    public static function fromModel(Reviewer $reviewer): self
    {
        return new self(
            id: $reviewer->id,
            reviewr_id: $reviewer->reviewer_id,
            meta_info: $reviewer->meta_inf ?? null,
            reputation_scores: $reviewer->relationLoaded('reputationScores')
            ? ReviewerReputationScoreData::collection($reviewer->reputationScores) : null,
        );
    }
}
