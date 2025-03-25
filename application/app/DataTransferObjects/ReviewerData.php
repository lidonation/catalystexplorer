<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use App\Models\ReviewerReputationScore;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\Optional as TypeScriptOptional;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class ReviewerData extends Data
{
    public function __construct(
        public ?string $hash,

        public $reviews_count,

        #[TypeScriptOptional]
        #[DataCollectionOf(ReviewerReputationScore::class)]
        public ?DataCollection $reputation_scores,

        public $catalyst_reviewer_id,

        #[TypeScriptOptional]
        public ?UserData $claimed_by,
    ) {}
}
