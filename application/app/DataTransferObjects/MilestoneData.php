<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Attributes\DataCollectionOf;

#[TypeScript]
final class MilestoneData extends Data
{
    public function __construct(

        public string $hash,

        public string $title,
        
        public bool $current,

        public string $outputs,

        public string $success_criteria,

        public string $evidence,

        public int $month,

        public float $cost,

        public int $completion_percent,

        public int $milestone,

        public string $created_at,

        #[DataCollectionOf(MilestoneSomReviewsData::class)]
        public ?DataCollection $som_reviews,

        #[DataCollectionOf(MilestonePoasData::class)]
        public ?DataCollection $poas
    ) {}
}
