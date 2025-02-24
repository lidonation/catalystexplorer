<?php

declare(strict_types=1);

namespace App\DataTransferObjects;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Attributes\DataCollectionOf;

#[TypeScript]
final class MilestonePoasData extends Data
{
    public function __construct(

        public string $hash,

        public string $content,
        
        public string $created_at,

        public bool $current,

        #[DataCollectionOf(MilestonePoasReviewData::class)]
        public ?DataCollection $reviews,

        #[DataCollectionOf(MilestonePoasSignoffData::class)]
        public ?DataCollection $signoffs,
    ) {}
}
