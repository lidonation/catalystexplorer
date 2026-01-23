<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\DataTransferObjects\Casts\ReviewRatingCast;
use Spatie\LaravelData\Attributes\WithCast;
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

        #[WithCast(ReviewRatingCast::class)]
        public int|RatingData|null $rating,

        public ?ProposalData $proposal,

        public ?ReviewerData $reviewer,

        public ?int $ranking_total,

        public ?int $positive_rankings,

        public ?int $negative_rankings,

        #[TypeScriptOptional]
        public ?string $discussion_id,

        #[TypeScriptOptional]
        #[TypeScript]
        #[DataCollectionOf(ProposalProfileData::class)]
        public ?DataCollection $team,
    ) {}
}
